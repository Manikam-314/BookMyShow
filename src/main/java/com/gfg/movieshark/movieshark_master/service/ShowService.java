package com.gfg.movieshark.movieshark_master.service;

import com.gfg.movieshark.movieshark_master.domain.Movie;
import com.gfg.movieshark.movieshark_master.domain.Show;
import com.gfg.movieshark.movieshark_master.domain.ShowSeat;
import com.gfg.movieshark.movieshark_master.domain.Theater;
import com.gfg.movieshark.movieshark_master.domain.TheaterSeats;
import com.gfg.movieshark.movieshark_master.enums.SeatType;
import com.gfg.movieshark.movieshark_master.exception.NotFoundException;
import com.gfg.movieshark.movieshark_master.repository.MovieRepository;
import com.gfg.movieshark.movieshark_master.repository.ShowRepository;
import com.gfg.movieshark.movieshark_master.repository.ShowSeatsRepository;
import com.gfg.movieshark.movieshark_master.repository.TheaterRepository;
import com.gfg.movieshark.movieshark_master.resource.ShowResource;
import com.gfg.movieshark.movieshark_master.resource.ShowSeatsResource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ShowService {

	Logger log = LoggerFactory.getLogger(ShowService.class);

	@Autowired
	private ShowRepository showsRepository;

	@Autowired
	private MovieRepository movieRepository;

	@Autowired
	private TheaterRepository theaterRepository;

	@Autowired
	private ShowSeatsRepository showSeatsRepository;

	public ShowService() {
	}

	public ShowResource addShow(ShowResource showResource) {

		Optional<Movie> optionalMovie = movieRepository.findById(showResource.getMovieId());

		if (!optionalMovie.isPresent()) {
			throw new NotFoundException("Movie Not Found with ID: " + showResource.getMovieId() + " to add New Show");
		}

		Optional<Theater> optionalTheater = theaterRepository.findById(showResource.getTheaterId());

		if (!optionalTheater.isPresent()) {
			throw new NotFoundException(
					"Theater Not Found with ID: " + showResource.getTheaterId() + " to add New Show");
		}

		log.info("Adding New Show: " + showResource);

		Show show = Show.toEntity(showResource);

		show.setMovie(optionalMovie.get());
		show.setTheater(optionalTheater.get());
		show.setMinPrice(showResource.getMinPrice());
		show.setMaxPrice(showResource.getMaxPrice());

		// Pass prices to generate seats
		show.setSeats(generateShowSeats(show.getTheater().getSeats(), show, showResource.getMinPrice(),
				showResource.getMaxPrice()));

		show = showsRepository.save(show);

		ShowResource result = Show.toResource(show);
		result.setBookedSeatsCount(0);
		result.setTotalSeatsCount(show.getSeats().size());
		return result;
	}

	private List<ShowSeat> generateShowSeats(
			List<TheaterSeats> theaterSeatsEntities,
			Show show, int minPrice, int maxPrice) {

		List<ShowSeat> showSeatsEntities = new ArrayList<>();

		if (!CollectionUtils.isEmpty(theaterSeatsEntities)) {
			// Theater has explicit seat config — use it
			for (TheaterSeats theaterSeats : theaterSeatsEntities) {
				int rate;
				if (theaterSeats.getSeatType() == SeatType.RECLINER) {
					rate = maxPrice;
				} else if (theaterSeats.getSeatType() == SeatType.SECOND_CLASS) {
					rate = minPrice;
				} else {
					rate = (minPrice + maxPrice) / 2;
				}

				ShowSeat showSeat = ShowSeat.builder()
						.seatNumber(theaterSeats.getSeatNumber())
						.seatType(theaterSeats.getSeatType())
						.rate(rate)
						.booked(false)
						.show(show)
						.build();
				showSeatsEntities.add(showSeat);
			}
		} else {
			// No TheaterSeats rows (auto-created theater) — generate grid from totalRows ×
			// totalColumns
			Theater theater = show.getTheater();
			int rows = theater.getTotalRows() != null ? theater.getTotalRows() : 10;
			int cols = theater.getTotalColumns() != null ? theater.getTotalColumns() : 15;
			for (int r = 0; r < rows; r++) {
				char rowChar = (char) ('A' + r);
				SeatType type = getSeatTypeForRow(r, rows);
				int price;
				if (type == SeatType.RECLINER) {
					price = maxPrice;
				} else if (type == SeatType.SECOND_CLASS) {
					price = minPrice;
				} else {
					price = (minPrice + maxPrice) / 2;
				}

				for (int c = 1; c <= cols; c++) {
					ShowSeat showSeat = ShowSeat.builder()
							.seatNumber(rowChar + String.valueOf(c))
							.seatType(type)
							.rate(price)
							.booked(false)
							.show(show)
							.build();
					showSeatsEntities.add(showSeat);
				}
			}
		}

		return showSeatsEntities;
	}

	private SeatType getSeatTypeForRow(int rowIndex, int totalRows) {
		if (totalRows <= 2) {
			return SeatType.FIRST_CLASS;
		}
		if (totalRows <= 5) {
			if (rowIndex == 0) {
				return SeatType.RECLINER;
			} else if (rowIndex == totalRows - 1) {
				return SeatType.SECOND_CLASS;
			} else {
				return SeatType.FIRST_CLASS;
			}
		}
		// totalRows >= 6
		if (rowIndex < 2) {
			return SeatType.RECLINER;
		} else if (rowIndex >= totalRows - 1) {
			return SeatType.SECOND_CLASS;
		} else {
			return SeatType.FIRST_CLASS;
		}
	}

	public List<String> getAvailableSlots(long theaterId, String date) {
		log.info("Fetching available slots for Theater ID: {}, Date: {}", theaterId, date);
		Optional<Theater> optionalTheater = theaterRepository.findById(theaterId);
		if (optionalTheater.isEmpty()) {
			throw new NotFoundException("Theater Not Found");
		}
		Theater theater = optionalTheater.get();
		String timingsStr = theater.getShowTimings();
		log.info("Theater found: {}. Preferred timings: {}", theater.getName(), timingsStr);

		if (!StringUtils.hasText(timingsStr)) {
			log.info("No preferred timings found for theater: {}", theater.getName());
			return new ArrayList<>();
		}

		String[] timingsArray = timingsStr.split(",");
		List<String> standardTimings = new ArrayList<>();

		// More robust formatter to handle H:mm, HH:mm, or HH:mm:ss
		java.time.format.DateTimeFormatter inputFormatter = new java.time.format.DateTimeFormatterBuilder()
				.appendPattern("[H:mm][HH:mm]")
				.appendOptional(java.time.format.DateTimeFormatter.ofPattern(":ss"))
				.toFormatter();
		java.time.format.DateTimeFormatter outputFormatter = java.time.format.DateTimeFormatter.ofPattern("HH:mm");

		for (String t : timingsArray) {
			try {
				if (StringUtils.hasText(t)) {
					java.time.LocalTime time = java.time.LocalTime.parse(t.trim(), inputFormatter);
					standardTimings.add(time.format(outputFormatter));
				}
			} catch (Exception e) {
				log.warn("Skipping invalid time format in theater config: '{}'. Error: {}", t, e.getMessage());
			}
		}
		log.info("Parsed standard timings: {}", standardTimings);

		// Fetch existing shows for this theater and date prefix
		List<Show> existingShows = showsRepository.findByTheaterIdAndShowTimeStartingWith(theaterId, date);

		List<String> bookedTimes = existingShows.stream()
				.filter(s -> s.getShowTime() != null)
				.map(s -> s.getShowTime().toLocalTime().format(outputFormatter))
				.collect(Collectors.toList());
		log.info("Booked timings for date {}: {}", date, bookedTimes);

		List<String> available = new ArrayList<>(standardTimings);
		available.removeAll(bookedTimes);
		log.info("Returning available slots: {}", available);

		return available;
	}

	public List<ShowResource> searchShows(String movieName, String cityName, String theaterName) {

		List<Show> shows = new ArrayList<>();
		if (StringUtils.hasText(movieName) && StringUtils.hasText(cityName))
			shows = showsRepository.findByMovieNameAndCity(movieName, cityName);
		else if (StringUtils.hasText(movieName)) {
			// New: Search by Movie Name only
			shows = showsRepository.findByMovieName(movieName);
		} else if (StringUtils.hasText(theaterName) && StringUtils.hasText(cityName)) {
			shows = showsRepository.findByTheaterAndCity(theaterName, cityName);
		} else if (StringUtils.hasText(theaterName)) {
			// Fallback or new query for just theater
			// We need a repository method for this.
			// For now, let's use findByTheaterAndCity with a dummy city or add a new method
			// to repo.
			// Actually, I should add findByTheaterName to repo first.
			// But wait, I can just use existing filtering or add method.
			// Let's add findByTheaterName to ShowRepository.
			shows = showsRepository.findByTheaterName(theaterName);
		} else if (StringUtils.hasText(cityName)) {
			shows = showsRepository.findByCity(cityName);
		}

		if (CollectionUtils.isEmpty(shows))
			return new ArrayList<>();
		else
			return shows.stream().map(s -> {
				ShowResource res = Show.toResource(s);
				if (s.getSeats() != null) {
					res.setTotalSeatsCount(s.getSeats().size());
					res.setBookedSeatsCount((int) s.getSeats().stream()
							.filter(com.gfg.movieshark.movieshark_master.domain.ShowSeat::isBooked).count());
				}
				return res;
			}).collect(Collectors.toList());
	}

	public List<ShowSeatsResource> getShowSeats(long showId) {
		Optional<Show> optionalShow = showsRepository.findById(showId);

		if (optionalShow.isEmpty()) {
			throw new NotFoundException("Show Not Found with ID: " + showId);
		}

		Show show = optionalShow.get();

		// If this show has no seats (e.g. created before auto-seat generation),
		// generate and save them now
		if (CollectionUtils.isEmpty(show.getSeats())) {
			ShowResource showResource = Show.toResource(show);
			int minP = showResource.getMinPrice() > 0 ? showResource.getMinPrice() : 80;
			int maxP = showResource.getMaxPrice() > 0 ? showResource.getMaxPrice() : 200;
			List<ShowSeat> generated = generateShowSeats(
					show.getTheater().getSeats(), show, minP, maxP);
			show.setSeats(generated);
			show = showsRepository.save(show);
			log.info("Auto-generated {} seats for existing show {}", generated.size(), showId);
		}

		return ShowSeat.toResource(show.getSeats());
	}

	public ShowResource getShowById(long id) {
		Optional<Show> optionalShow = showsRepository.findById(id);
		if (optionalShow.isEmpty()) {
			throw new NotFoundException("Show Not Found with ID: " + id);
		}
		return Show.toResource(optionalShow.get());
	}

	public List<ShowResource> getAllShows() {
		List<Show> shows = showsRepository.findAll();
		if (CollectionUtils.isEmpty(shows))
			return new ArrayList<>();
		else
			return shows.stream().map(s -> {
				ShowResource res = Show.toResource(s);
				if (s.getSeats() != null) {
					res.setTotalSeatsCount(s.getSeats().size());
					res.setBookedSeatsCount((int) s.getSeats().stream()
							.filter(com.gfg.movieshark.movieshark_master.domain.ShowSeat::isBooked).count());
				}
				return res;
			}).collect(Collectors.toList());
	}

}
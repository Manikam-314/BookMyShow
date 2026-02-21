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

		// Pass prices to generate seats
		show.setSeats(generateShowSeats(show.getTheater().getSeats(), show, showResource.getMinPrice(),
				showResource.getMaxPrice()));

		show = showsRepository.save(show);

		return Show.toResource(show);
	}

	private List<ShowSeat> generateShowSeats(
			List<TheaterSeats> theaterSeatsEntities,
			Show show, int minPrice, int maxPrice) {

		List<ShowSeat> showSeatsEntities = new ArrayList<>();

		if (CollectionUtils.isEmpty(theaterSeatsEntities)) {
			return showSeatsEntities;
		}

		for (TheaterSeats theaterSeats : theaterSeatsEntities) {

			ShowSeat showSeat = ShowSeat.builder()
					.seatNumber(theaterSeats.getSeatNumber())
					.seatType(theaterSeats.getSeatType())
					.rate(theaterSeats.getSeatType() == SeatType.RECLINER ? maxPrice : minPrice)
					.booked(false)
					.show(show)
					.build();

			showSeatsEntities.add(showSeat);
		}

		return showSeatsEntities;
	}

	public List<String> getAvailableSlots(long theaterId, String date) {
		Optional<Theater> optionalTheater = theaterRepository.findById(theaterId);
		if (optionalTheater.isEmpty()) {
			throw new NotFoundException("Theater Not Found");
		}
		Theater theater = optionalTheater.get();
		String timingsStr = theater.getShowTimings();
		if (!StringUtils.hasText(timingsStr)) {
			return new ArrayList<>();
		}

		String[] timingsArray = timingsStr.split(",");
		List<String> standardTimings = new ArrayList<>();
		// Handle potentially different input formats like "9:30" or "09:30"
		java.time.format.DateTimeFormatter inputFormatter = java.time.format.DateTimeFormatter
				.ofPattern("[H:mm][HH:mm]");
		java.time.format.DateTimeFormatter outputFormatter = java.time.format.DateTimeFormatter.ofPattern("HH:mm");

		for (String t : timingsArray) {
			try {
				java.time.LocalTime time = java.time.LocalTime.parse(t.trim(), inputFormatter);
				standardTimings.add(time.format(outputFormatter));
			} catch (Exception e) {
				log.warn("Skipping invalid time format in theater config: " + t);
			}
		}

		// Fetch existing shows for this theater and date
		List<Show> existingShows = showsRepository.findAll().stream()
				.filter(s -> s.getTheater().getId().equals(theaterId))
				.filter(s -> s.getShowTime().toString().startsWith(date))
				.collect(Collectors.toList());

		List<String> bookedTimes = existingShows.stream()
				.map(s -> s.getShowTime().toLocalTime().format(outputFormatter))
				.collect(Collectors.toList());

		return standardTimings.stream()
				.filter(t -> !bookedTimes.contains(t))
				.collect(Collectors.toList());
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
			return shows.stream().map(Show::toResource).collect(Collectors.toList());
	}

	public List<ShowSeatsResource> getShowSeats(long showId) {
		Optional<Show> optionalShow = showsRepository.findById(showId);

		if (optionalShow.isEmpty()) {
			throw new NotFoundException("Show Not Found with ID: " + showId);
		}

		return ShowSeat.toResource(optionalShow.get().getSeats());
	}

	public ShowResource getShowById(long id) {
		Optional<Show> optionalShow = showsRepository.findById(id);
		if (optionalShow.isEmpty()) {
			throw new NotFoundException("Show Not Found with ID: " + id);
		}
		return Show.toResource(optionalShow.get());
	}

}
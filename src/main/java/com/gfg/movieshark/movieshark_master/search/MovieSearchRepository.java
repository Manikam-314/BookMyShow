package com.gfg.movieshark.movieshark_master.search;

import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data Elasticsearch Repository for MovieIndex searches.
 */
@Repository
public interface MovieSearchRepository extends ElasticsearchRepository<MovieIndex, String> {

    // Simple keyword matches can be done via method names
    List<MovieIndex> findByMovieTitleContaining(String title);
    
    List<MovieIndex> findByCityContaining(String city);

    List<MovieIndex> findByTheaterNameContaining(String theaterName);
}

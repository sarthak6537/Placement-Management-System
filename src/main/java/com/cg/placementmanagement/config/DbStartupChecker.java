package com.cg.placementmanagement.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;

@Component
public class DbStartupChecker implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DbStartupChecker.class);

    private final DataSource dataSource;

    public DbStartupChecker(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public void run(String... args) throws Exception {
        try (Connection c = dataSource.getConnection(); Statement s = c.createStatement()) {
            logger.info("Connected to database: {}", c.getMetaData().getURL());
            try (ResultSet rs = s.executeQuery("SELECT 1")) {
                if (rs.next()) {
                    logger.info("Database check succeeded: SELECT 1 returned {}", rs.getInt(1));
                }
            }
        } catch (Exception e) {
            logger.error("Database connection check failed", e);
            throw e;
        }
    }
}

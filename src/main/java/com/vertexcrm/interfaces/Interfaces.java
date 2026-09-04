package com.vertexcrm.interfaces;

public class Interfaces {


/**
 * UNIT 4: Interface for Data Export
 */
public interface Exportable {
    String exportToSummary();
}



/**
 * UNIT 4: Interface Definition & Contract
 * Demonstrates abstract methods and default methods in interfaces.
 */
public interface Searchable {
    // Abstract method
    boolean matches(String query);

    // Default method (Java 8+)
    default void printSearchDebug(String query) {
        System.out.println("[Searchable Interface] Checking match for query: " + query);
    }
}

}


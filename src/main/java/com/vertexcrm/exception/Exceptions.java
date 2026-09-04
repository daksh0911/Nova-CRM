package com.vertexcrm.exception;

public class Exceptions {


/**
 * UNIT 5: User-Defined Unchecked Exception
 * Demonstrates unchecked runtime validation exception.
 */
public static class InvalidCrmDataException extends RuntimeException {
    public InvalidCrmDataException(String message) {
        super(message);
    }
}



/**
 * UNIT 5: User-Defined Checked Exception
 * Demonstrates custom exception hierarchy extending java.lang.Exception.
 */
public static class ResourceNotFoundException extends Exception {
    private String resourceName;
    private String resourceId;

    public ResourceNotFoundException(String resourceName, String resourceId) {
        super(resourceName + " with ID '" + resourceId + "' was not found in CRM repository.");
        this.resourceName = resourceName;
        this.resourceId = resourceId;
    }

    public String getResourceName() { return resourceName; }
    public String getResourceId() { return resourceId; }

    @Override
    public String toString() {
        return "ResourceNotFoundException: [" + resourceName + " -> " + resourceId + "]";
    }
}

}


package com.vertexcrm.thread;

public class Threads {


/**
 * UNIT 5: Multithreading by Implementing java.lang.Runnable Interface
 */
public static class AsyncAuditLogger implements Runnable {
    private String actor;
    private String action;

    public AsyncAuditLogger(String actor, String action) {
        this.actor = actor;
        this.action = action;
    }

    @Override
    public void run() {
        System.out.println("[Async Audit Logger Thread: " + Thread.currentThread().getName() + 
                           "] Logging event for operator: " + actor + " -> " + action);
    }
}



/**
 * UNIT 5: Multithreading by Extending java.lang.Thread
 * Demonstrates:
 * - Thread lifecycle (New -> Runnable -> Running -> Timed Waiting -> Terminated)
 * - run() method override and start() execution
 * - try-catch handling inside thread execution
 */
public static class BackgroundTelemetryThread extends Thread {
    private volatile boolean running = true;
    private int pingCount = 0;

    public BackgroundTelemetryThread() {
        super("Vertex-Telemetry-Thread");
    }

    @Override
    public void run() {
        System.out.println("[Thread Lifecycle] " + getName() + " entered RUNNING state.");
        try {
            while (running && pingCount < 5) {
                pingCount++;
                // UNIT 5: Timed Waiting state
                Thread.sleep(10000); 
                System.out.println("[Telemetry Worker] Heartbeat #" + pingCount + " synchronized on Node IN-AHM-01.");
            }
        } catch (InterruptedException e) {
            System.out.println("[Thread Exception] Telemetry thread interrupted: " + e.getMessage());
        }
        System.out.println("[Thread Lifecycle] " + getName() + " reached TERMINATED state.");
    }

    public void stopTelemetry() {
        this.running = false;
    }
}

}


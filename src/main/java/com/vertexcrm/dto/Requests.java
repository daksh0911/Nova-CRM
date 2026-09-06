package com.vertexcrm.dto;

public class Requests {

    public static class CreateClientRequest {
        public String name;
        public String industry;
        public String email;
        public String phone;
        public String location;
        public String owner;
    }

    public static class CreateLeadRequest {
        public String id;
        public String name;
        public String tag;
        public String contact;
        public String email;
        public String phone;
        public String assigned;
        public String stage;
        public String priority;
        public String nextStep;
        public double value;
    }

    public static class CreateTaskRequest {
        public String title;
        public String assignedTo;
        public String priority;
    }

    public static class CreateUserRequest {
        public String name;
        public String email;
        public String phone;
        public String role;
        public String dept;
    }

    public static class SaveNoteRequest {
        public String user;
        public String note;
    }

    public static class UpdateLeadStageRequest {
        public String stage;
    }

}

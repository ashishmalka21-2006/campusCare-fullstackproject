package com.campuscare.dto.admin;

import java.util.Map;
import java.util.List;

public class DashboardStatsResponse {
    private long totalComplaints;
    private long pendingComplaints;
    private long inProgressComplaints;
    private long resolvedComplaints;
    private long reopenedComplaints;
    private long closedComplaints;
    private long totalStudents;
    private long totalStaff;
    private long totalDepartments;
    private double avgResolutionHours;

    private Map<String, Long> complaintsByDepartment;
    private Map<String, Long> complaintsByPriority;
    private Map<String, Long> complaintsByStatus;
    private List<Map<String, Object>> complaintsByMonth;

    public DashboardStatsResponse() {
    }

    public long getTotalComplaints() {
        return totalComplaints;
    }

    public void setTotalComplaints(long totalComplaints) {
        this.totalComplaints = totalComplaints;
    }

    public long getPendingComplaints() {
        return pendingComplaints;
    }

    public void setPendingComplaints(long pendingComplaints) {
        this.pendingComplaints = pendingComplaints;
    }

    public long getInProgressComplaints() {
        return inProgressComplaints;
    }

    public void setInProgressComplaints(long inProgressComplaints) {
        this.inProgressComplaints = inProgressComplaints;
    }

    public long getResolvedComplaints() {
        return resolvedComplaints;
    }

    public void setResolvedComplaints(long resolvedComplaints) {
        this.resolvedComplaints = resolvedComplaints;
    }

    public long getReopenedComplaints() {
        return reopenedComplaints;
    }

    public void setReopenedComplaints(long reopenedComplaints) {
        this.reopenedComplaints = reopenedComplaints;
    }

    public long getClosedComplaints() {
        return closedComplaints;
    }

    public void setClosedComplaints(long closedComplaints) {
        this.closedComplaints = closedComplaints;
    }

    public long getTotalStudents() {
        return totalStudents;
    }

    public void setTotalStudents(long totalStudents) {
        this.totalStudents = totalStudents;
    }

    public long getTotalStaff() {
        return totalStaff;
    }

    public void setTotalStaff(long totalStaff) {
        this.totalStaff = totalStaff;
    }

    public long getTotalDepartments() {
        return totalDepartments;
    }

    public void setTotalDepartments(long totalDepartments) {
        this.totalDepartments = totalDepartments;
    }

    public double getAvgResolutionHours() {
        return avgResolutionHours;
    }

    public void setAvgResolutionHours(double avgResolutionHours) {
        this.avgResolutionHours = avgResolutionHours;
    }

    public Map<String, Long> getComplaintsByDepartment() {
        return complaintsByDepartment;
    }

    public void setComplaintsByDepartment(Map<String, Long> complaintsByDepartment) {
        this.complaintsByDepartment = complaintsByDepartment;
    }

    public Map<String, Long> getComplaintsByPriority() {
        return complaintsByPriority;
    }

    public void setComplaintsByPriority(Map<String, Long> complaintsByPriority) {
        this.complaintsByPriority = complaintsByPriority;
    }

    public Map<String, Long> getComplaintsByStatus() {
        return complaintsByStatus;
    }

    public void setComplaintsByStatus(Map<String, Long> complaintsByStatus) {
        this.complaintsByStatus = complaintsByStatus;
    }

    public List<Map<String, Object>> getComplaintsByMonth() {
        return complaintsByMonth;
    }

    public void setComplaintsByMonth(List<Map<String, Object>> complaintsByMonth) {
        this.complaintsByMonth = complaintsByMonth;
    }
}

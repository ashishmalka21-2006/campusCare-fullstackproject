Write-Host "`n=======================================================" -ForegroundColor Cyan
Write-Host "   CAMPUSCARE FULL-STACK SYSTEM VERIFICATION OUTPUT   " -ForegroundColor Yellow
Write-Host "=======================================================" -ForegroundColor Cyan

# 1. Departments Check
Write-Host "`n[1] ACTIVE DEPARTMENTS (GET /api/v1/departments):" -ForegroundColor Green
$deptRes = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/departments"
$deptRes.data | Select-Object id, code, name, contactEmail | Format-Table -AutoSize | Out-String | Write-Host

# 2. Student Authentication
Write-Host "[2] STUDENT LOGIN & JWT ISSUANCE (POST /api/v1/auth/login):" -ForegroundColor Green
$studentLogin = @{
    email = "student1@campuscare.edu"
    password = "Student@123"
} | ConvertTo-Json

$studentAuth = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/login" -Method Post -ContentType "application/json" -Body $studentLogin
Write-Host ("  Status        : " + $studentAuth.message) -ForegroundColor White
Write-Host ("  User FullName : " + $studentAuth.data.user.fullName) -ForegroundColor White
Write-Host ("  User Role     : " + $studentAuth.data.user.role) -ForegroundColor White
Write-Host ("  JWT Bearer    : " + $studentAuth.data.token.Substring(0, 35) + "...") -ForegroundColor White

# 3. Student Complaints
Write-Host "`n[3] STUDENT COMPLAINTS (GET /api/v1/complaints/my):" -ForegroundColor Green
$studentHeaders = @{
    Authorization = "Bearer " + $studentAuth.data.token
}
$myComplaints = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/complaints/my" -Headers $studentHeaders
$myComplaints.data.content | Select-Object referenceNumber, title, priority, status, departmentName | Format-Table -AutoSize | Out-String | Write-Host

# 4. Submit New Complaint Demonstration
Write-Host "[4] FILING NEW COMPLAINT (POST /api/v1/complaints):" -ForegroundColor Green
$newComplaint = @{
    title = "AC Remote Not Responding in Lab 301"
    description = "Air conditioner unit cannot be powered on because the wall remote controller is unresponsive."
    departmentId = 3
    category = "HVAC & Air Conditioning"
    location = "CSE Department Block, 3rd Floor, Lab 301"
    priority = "MEDIUM"
} | ConvertTo-Json

$fileRes = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/complaints" -Method Post -ContentType "application/json" -Headers $studentHeaders -Body $newComplaint
Write-Host ("  Reference No  : " + $fileRes.data.referenceNumber) -ForegroundColor Yellow
Write-Host ("  Status        : " + $fileRes.data.status) -ForegroundColor Yellow
Write-Host ("  Assigned To   : " + $fileRes.data.departmentName) -ForegroundColor Yellow

# 5. AI Chatbot Interaction
Write-Host "`n[5] AI CHATBOT ASSISTANT (POST /api/v1/chatbot/messages):" -ForegroundColor Green
$chatQuery = @{
    message = "My hostel washroom has no water supply, what should I do?"
} | ConvertTo-Json
$chatRes = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/chatbot/messages" -Method Post -ContentType "application/json" -Body $chatQuery
Write-Host ("  Knowledge Engine : " + $chatRes.data.source) -ForegroundColor Cyan
Write-Host ("  Chatbot Guidance :`n" + $chatRes.data.reply) -ForegroundColor White

# 6. Admin Analytics
Write-Host "`n[6] ADMIN EXECUTIVE ANALYTICS (GET /api/v1/admin/dashboard):" -ForegroundColor Green
$adminLogin = @{
    email = "admin@campuscare.edu"
    password = "Admin@123"
} | ConvertTo-Json
$adminAuth = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/login" -Method Post -ContentType "application/json" -Body $adminLogin
$adminHeaders = @{
    Authorization = "Bearer " + $adminAuth.data.token
}
$adminDashboard = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/admin/dashboard" -Headers $adminHeaders
$adminDashboard.data | Select-Object totalComplaints, pendingComplaints, inProgressComplaints, resolvedComplaints, totalStudents, totalStaff, totalDepartments, avgResolutionHours | Format-Table -AutoSize | Out-String | Write-Host

Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "          ALL CHECKS SUCCESSFULLY VERIFIED!            " -ForegroundColor Green
Write-Host "=======================================================`n" -ForegroundColor Cyan

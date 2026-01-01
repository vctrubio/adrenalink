
// an sql fetch to getSQLEventBoardData

/* WHat i think should happen

-headers has school subdomain, 
subdomain username-> id, timezone, currency, name, ...

fetch all bookings, with school id

ONE QUEY ONE JOIN
booking->bookinstudents (for students of booking)
booking->schoolPackage (for price determination)
booking->lessons
booking->events -> equipment if exist

useTeacherProvider already exist for us. 


THIS should return ClassboardModel. 
*/
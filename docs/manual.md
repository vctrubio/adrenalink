# Manual Read to Entity Configs in Adrenalink.

```tsx
export interface EntityInfo {
  description?: string;
  schema: Record<string, any>;
  table: InfoField[];
}

export interface EntityConfig {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  link: string;
  description: string[];
  relations: string[];
  info?: EntityInfo; // Optional rainbow card info
}
```

this is what is required to hover a rainbow, its missing shade, id

below is the shade, color entityinfo ect for each one.

1. School
   grey-1
   School
   SchoolIcon
   description:
   -- Sign up via the Welcome Form (span-link). Register your intragram, website, contact details and googlePlaceId so we can boost your X.
   We provide you with a subdomain within us, where you will have your own personal space | Make sure to add an Icon and Banner for style.
   Usernames, or subdomains, are unqiue, so first come first serve. What are you waiting for, begin your journey wiht us here (same span-link).
   Or continue reading this manual for a better understanding.
   schema:
   -- username, name, country, currency, phone, googlePlaceId, instagram, website
   table: example of row data (use table schema fields in order. so we can change this to rows directrely.)
   -- hostel, tarifa kite hoste, tarifa, euro, +347238282, abcshdd888, @myfitskitetarifa, tkhhostem.com

2. Referals.
   gray-2
   ...
   description:
   -- Start by adding referrals - this is anyone that has permission/access to give discounts, or simply point someone your way.
   Wouldn't it be nice that by the end of the yerar, you know how hard or soft someone has worked?
   Give someone, a code so they can share, and decide how much percentage 'discount' the student recieves, (whikle going into somebady elses hand. thisd has a name.... buybacks/shifting of monmey/ what is it....)
   schema:
   -- codeHexa, descrption, comission
   row:
   -- WATERMAN69, Early pack discount for semi private lessons. 10% off

3. Rentals
   red-1
   ...
   description:
   -- Rentals can be new users looking to rent, or students who been marked safe for independent riding. Either way,
   you trust them to make reservations to your equipment, while we track everything.
   The price per hour, or pph is defined in your package. More on that next. And your currency is the value we calculate later.
   schema:
   -- name, date, duration, equipmentId, pph (price per hour)
   table:
   jose, Nov 14 16:00, 2h, Reach12, 45

4. Packages
   orange-1
   ...
   description:
   -- here is your priceboard, where we configure what courses you want to sell, or what rental equipment your have to offer.
   You decide if you want the public to see, or if its only for internal view. Either way, this is the entry to creating a booking.
   Students, or users, will visit your space, pick a course, and request a date to start.
   schema:
   -- description, duration, price per student, capacity of students, equipment capacity, public,
   Zero to Hero, 8h, 450, 2, 1 Kite,
   Downwind Body Drag, 4h, 300, 1, 1 Kite
   Kite Rental, 2h, 90, 1, 1 Kite

5. Request
   orange-2
   ...
   desciption:
   -- as users browe your site, they can make a request for one of your package offers. Lets say Miguel,
   liked your Zero to Hero, and want to start learning how to kite, he would simple click and apply. You would
   now recieve data inside your dashboard.
   schema:
   -- Name, Date, Package
   Miguel, 24-12-2025 28-12-2025, Zero to Hero

6. Students
   yellow-1
   description.
   -- MIguel got lucky, he's ready to start on christmas eve, 24hrs before every kite instructors favorite day.
   All students fill out a welcome form, where they provide your with personal details, and recieve an invitation to the app.
   schema:
   -- Full name, country, passport, languages, email (for loggin in)
   Miguel Hernansanz, ESPAÑA, ABC834712, Spanish & Frnehc, miguelon@gmail.com

7. Bookings
   blue-1
   description:
   -- Bookings are the centerpiece of this applications. So far we've added a package, a student has request that package,
   We've accepted that package, and the system has genrated a booking for those dates.
   This will show the total hours, the number of students, what equipment they willhow manyu days they have to compelte, and now
   what teacher should we assign? Also known as a lesson plan. Read 8 next.
   schema:
   -- dates, students, package, referalCode
   24-12-2025 +4 days, Miguel, Zero to Hero
   24-12-2025 +7 days, Fernando, Zero to Hero, WATERMAN69

- woops i forgot green tachers and comission
  Teacher
  green-1
  description:

schema:
-- full name, username, languages
Titor Rito, titor, Sniah French English
Lila Jones, lila, Spanish, English

COmissin
green-2
deescirptioin:
You assign a comission rate to a teahcer in their profile. A comssion consist of a
value, with a type: percetange based , or a fixed based salary. Together they define how
much a teacher will earn through each lesson plan.
schema:
-- username, comission, description
lila, 25%, Comission based
titor, 25pph, Normal rate ph
titor, 30pph, If referers students
titor, 35pph, For semi privates

8. Lesson
   blue-2
   description:
   -- lets assign our teacher Isabel to Miguel, create that lesson plan by simply linking Isabel
   to this booking, give her a specific comission from her profile. This notifies both the student and teacher
   that a lesson plan has been created.
   schema:
   -- teacher, comission, bookingId
   Isabel, 21%, bcd456

9. Events
   blue-3
   description:
   -1- when we want to do the actual lesson planning, This is the core of our operations.
   The classboard component consit of setting and creating class at ease. We have a controller, so orchasted the time, duration, location of selected dates.
   Changing an event is syncrosnised with the rest of the class. And everybody is noitified. We have
   3 different views for the same event. ADministration, student and teacher. More on that once you enter our app. Or subscribe
   to our waiting list, where I will personaly start sending out video recording of all of this in action.
   schema:
   -- date, duration, students, teacher, equipment, status
   Dec 24 16:00, 2h, Miguelon, titor, Reach 8m, completed

10. Equipment
    purple-1
    description:
    Register your stock, then track its activity or injuries. Equuipments are attached to packages, and they define
    what booking, lesson and event was used. Equipment are

- either for rental
- linked to a teacher
- free of use
- ready to sell,
  schema:
  xxx

11. Repairs
    purple-2
    description:
    this is specifically linked to each equipment id. When something needs reparing, mark the check in, check out, and price.
    This way, you can see the history, and together with the flight time, it easy to spot when someting needs replacing.
    schema:
    -- date, price, description
    Dec 25, 75, leading eadge repair

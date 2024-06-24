Project Name: BusinessConnect

Intern: Ogenna Angela Obiora

Intern Manager: Jose Luis Esquivel Valencia

Intern Director: Sonia Uppal

Peer(s): Myles Domingo and Sina Pinto

GitHub Repository Link: https://github.com/Iamogeee/BusinessConnect

Project Template Link: https://docs.google.com/document/d/1tcovAehQXTjjX_WmCvKCgHbrgbDFGp-Mmb1rFLXsq9Y/edit?usp=sharing

Overview

[Provide a brief description of what your project is about and what problems it aims to solve.]

Category: Local Services and E-commerce
Story: BusinessConnect allows students to sign up and create profiles, search for businesses based on their location, read and write reviews, rate services, and interact with their peers for more information. The website emphasizes peer reviews and direct messaging, making it easy for students to find services tailored to their needs and preferences.
Market: The primary market for BusinessConnect includes students in remote and unfamiliar areas who need to find trustworthy local services, such as restaurants, salons, repair services, and fitness centers. The app targets students who prefer personalized and reliable recommendations from their peers over generic search results.
Habit: BusinessConnect is designed for frequent use. Students may use the app several times a week to find new businesses, check reviews, and interact with peers for recommendations and more information.
Scope: The initial scope of BusinessConnect will focus on key features such as business listings, peer reviews, ratings, sample work galleries, and in-app messaging. Future enhancements might include loyalty programs and integration with social media platforms.

Product Spec
BusinessConnect is a user-friendly website designed to help students effortlessly discover and engage with local businesses. Users can search for nearby services, read authentic reviews from their peers, view ratings, and browse sample work. The site offers innovative features such as peer-to-peer messaging. Customers can save favorite businesses and view the businesses closest to them on a map. With real-time notifications, social media sharing, and detailed business profiles, BusinessConnect makes finding and interacting with local businesses a seamless and rewarding experience.

User Stories
User stories are actions that the user should be able to perform in your app.

First, focus and identify functionality that is required for your MVP (Minimum Viable Product) that conforms to all the project requirements and expectations. Make sure your technical challenges are part of your MVP.

You should also identify optional / nice-to-have functionalities that would be done as stretch goals during MU Week 8 and 9. Remember, technical challenges should not be optional features, they must be code complete before the end of Week 8!

Required

User can login.
User can create an account.
User can search for businesses by location.
User can view business profiles.
User can read and write reviews.
User can receive personalized recommendations.
User can see business hours and contact information.
User can save favorite businesses.
User can edit their profile information.
User can view exclusive deals and offers.


Optional
User can create multimedia reviews.
User can message peers for more information about businesses.
User can view and manage their bookings.


Screen Archetypes
![1](https://github.com/Iamogeee/BusinessConnect/assets/126437546/c024b6a7-3c2d-46e3-a34f-72f8907b40cc)

![2](https://github.com/Iamogeee/BusinessConnect/assets/126437546/01419f8a-e194-4286-9cfa-3fa187a36739)

![3](https://github.com/Iamogeee/BusinessConnect/assets/126437546/5de3aee9-f9b9-483b-94a3-d0cdcdf5596b)

![4](https://github.com/Iamogeee/BusinessConnect/assets/126437546/eafc1d7a-d390-4c65-956d-0ca7b1e62ee1)

![BizConnect](https://github.com/Iamogeee/BusinessConnect/assets/126437546/4d841a3c-0d16-4cb3-a0f8-b922083d5c8e)

![6](https://github.com/Iamogeee/BusinessConnect/assets/126437546/68908dfc-6604-43ef-b640-95c663755462)

![7](https://github.com/Iamogeee/BusinessConnect/assets/126437546/d2b95a03-107c-4788-a60a-88e9f41895f5)

![8](https://github.com/Iamogeee/BusinessConnect/assets/126437546/11d53b6c-7b04-4f7e-bbdd-eb54e8efbc82)

![9](https://github.com/Iamogeee/BusinessConnect/assets/126437546/92ff6859-c927-460b-ad05-07801397156b)

![10](https://github.com/Iamogeee/BusinessConnect/assets/126437546/3b49fea1-7383-4ea4-a8c0-31405b68a286)


Data Model

[Describe the data you’re going to need to back your application. This can include database models (like tables), or external data you’ll require from some API.]

User Table:

ID (Primary Key)
Name
Email
Password
Profile Information
Interests

Business Table:

ID (Primary Key)
Name
Location
Contact Information
Business Hours
Services Offered
Ratings and Reviews (average)
Business type/category

Review Table:

ID (Primary Key)
User ID (Foreign Key)
Business ID (Foreign Key)
Rating
Review Text
Multimedia (optional)

Deal Table:

ID (Primary Key)
Business ID (Foreign Key)
Description
Validity Period

Recommendation Table:

ID (Primary Key)
User ID (Foreign Key)
Business ID (Foreign Key)

Message Table (Optional):

ID (Primary Key)
Sender ID (Foreign Key)
Receiver ID (Foreign Key)
Message Text
Timestamp



Server Endpoints

[Describe the endpoints that your application is going to consume from your server. If you’re using REST, then you’ll probably want to include the method (GET/POST/etc) and the expected parameters (query parameters, body parameters, etc.)]


User Endpoints:

POST /login: User login
Request Body: { email, password }
POST /signup: Create a new user account
Request Body: { name, email, password, profileInformation, interests }
GET /users/{id}: Get user profile information
Path Parameter: { id }
PUT /users/{id}: Edit user profile information (optional)
Path Parameter: { id }
Request Body: { name, email, profileInformation, interests }

Business Endpoints:

GET /businesses: Search for businesses by location and other filters
Query Parameters: { location, category, rating, distance }
GET /businesses/{id}: View business profile
Path Parameter: { id }
GET /businesses/{id}/reviews: Get reviews for a business
Path Parameter: { id }
GET /businesses/{id}/deals: View exclusive deals and offers
Path Parameter: { id }

Review Endpoints:

POST /reviews: Write a new review
Request Body: { userId, businessId, rating, reviewText, multimedia (optional) }
GET /reviews/{id}: Get a specific review
Path Parameter: { id }
POST /reviews/{id}/multimedia: Add multimedia to a review (optional)
Path Parameter: { id }
Request Body: { multimedia }

Recommendation Endpoints:

GET /recommendations: Get personalized recommendations for a user
Query Parameter: { userId }

Message Endpoints (Optional):

POST /messages: Send a message to a peer
Request Body: { senderId, receiverId, messageText }
GET /messages/{id}: Get a specific message
Path Parameter: { id }
GET /messages: Get all messages for a user
Query Parameter: { userId }


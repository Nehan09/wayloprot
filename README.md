# Waylo Shopper

Build a full-stack prototype called Waylo — Smart Shopping Cart, designed specifically as a working prototype for a hackathon.

The product is a smart shopping cart for large supermarkets and hypermarkets. The cart helps shoppers search for products, find their exact aisle/shelf, navigate through the store using an indoor map, manage a shopping list, scan products, track their bill in real time, and complete checkout.

IMPORTANT:

This should feel like a smart shopping cart touchscreen interface, NOT a normal e-commerce website.

Prioritize functionality and a smooth demo flow over unnecessary animations.

Keep the UI clean, modern, fast, and easy to use on a 7-inch touchscreen/tablet mounted on a shopping cart.

Do not make the design overly complicated.

Use realistic Indian supermarket examples and prices in INR (₹).

Build the application so the frontend and backend are clearly separated.

Do not hardcode all functionality into React. Use backend APIs and a database.

TECH STACK

Frontend

React

JavaScript

CSS

Responsive touchscreen-first UI

React Router for navigation where appropriate

Backend

Node.js

Express.js

REST APIs

CORS

dotenv for environment variables

Database

MySQL

Use a proper relational schema

Backend should communicate with MySQL

Do not use localStorage as the primary database

Navigation

Represent the supermarket as a graph of walkable nodes and connections.

Implement A pathfinding* for calculating routes.

Product locations should be stored in the database using aisle, shelf and map coordinates/node IDs.

The frontend should visualize the calculated route on the store map.

Future hardware readiness

Design the backend/API structure so that it can later communicate with:

ESP32

BLE beacons for indoor positioning

Barcode scanner

RFID reader

Do NOT require these physical devices for the current prototype. Create clean interfaces/API endpoints so they can be integrated later.

APPLICATION STRUCTURE

Create these major sections:

Welcome / Cart Home

Product Search

Product Details

Indoor Store Map

Navigation

Shopping List

Cart / Live Bill

Barcode Scan

Checkout

The user should be able to move naturally through the complete shopping journey:

WELCOME
→ SEARCH PRODUCT
→ PRODUCT DETAILS
→ NAVIGATE
→ ADD/SCAN PRODUCT
→ LIVE BILL
→ SEARCH NEXT PRODUCT
→ NAVIGATE
→ CHECKOUT

1. WELCOME / CART HOME

Create a simple touchscreen-friendly home screen.

Display:

WAYLO

"Smart Shopping Cart"

Main buttons:

🔎 Search Products

📝 Shopping List

🛒 My Cart

🗺️ Store Map

📷 Scan Product

Also display a small summary:

Items in cart

Current total

Example:

Items: 3
Total: ₹515

The screen should immediately communicate that this is a physical smart cart.

2. PRODUCT SEARCH

Create a large touchscreen-friendly search bar.

Example placeholder:

"Search for a product..."

Include:

Search button

Category filters

Popular/recent searches if useful

When the user searches:

"Head & Shoulders"

retrieve matching products from the backend API/database.

Display product cards containing:

Product image

Product name

Brand

Price

Availability

Aisle number

Example:

Head & Shoulders Anti-Dandruff Shampoo
₹280
Aisle 12
Available

Each product should have:

View Details
Navigate
Add to List
Add to Cart

Search must actually query the backend/database.

3. PRODUCT DETAILS

Create a dedicated product details screen.

Show:

Product image

Product name

Brand

Description

Price

Aisle

Shelf

Availability

Barcode/product ID

Example:

Head & Shoulders Anti-Dandruff Shampoo

Price: ₹280
Aisle: 12
Shelf: 3
Availability: In Stock

Buttons:

Navigate to Product
Add to Shopping List
Add to Cart

The product location must come from the database.

4. INDOOR STORE MAP

Create a realistic supermarket floor map using SVG or another interactive web-based map, NOT a static image.

The map should contain:

Entrance

Checkout

Aisles

Shelves

Product sections

Walkable paths

Important store areas

Example sections:

Aisle 1 — Dairy
Aisle 2 — Bakery
Aisle 3 — Beverages
Aisle 4 — Snacks
Aisle 5 — Personal Care
Aisle 6 — Household
etc.

Use a graph representation behind the map.

Each walkable intersection should be a node.

Each connection between nodes should be an edge with a distance/cost.

Products should map to specific nodes or locations.

Allow the frontend to highlight:

Current cart location

Destination product

Calculated route

Create a clear legend.

5. NAVIGATION

When the user selects "Navigate to Product":

Get the product's location from the backend.

Determine the cart's current location.

Send the navigation request to the backend.

Backend calculates the shortest/most efficient path using A*.

Return the path to React.

Display the path visually on the store map.

Example:

Current location:
Entrance

Destination:
Head & Shoulders — Aisle 12, Shelf 3

Display:

"Head & Shoulders is 85m away"

Then visually highlight the route.

Show simple instructions such as:

"Go straight"
"Turn right"
"Continue to Aisle 8"
"Continue to Aisle 12"

For the current prototype, allow the cart's current position to be selected/simulated manually.

IMPORTANT:
Do not fake the route with a pre-defined animation. The route should be generated from the store graph using A*.

6. MULTI-PRODUCT ROUTING

This is an important Waylo feature.

Allow users to add several products to their shopping list.

Example:

Milk

Bread

Head & Shoulders

Coffee

Then provide:

Optimize My Route

The system should calculate a reasonable shopping sequence through the store.

For the prototype, use a practical heuristic if necessary rather than an extremely complex optimization algorithm.

Display:

Shopping Route:

Entrance
↓
Dairy — Milk
↓
Bakery — Bread
↓
Beverages — Coffee
↓
Personal Care — Head & Shoulders
↓
Checkout

Show the route on the map.

7. SHOPPING LIST

Create a shopping-list screen.

Features:

Search/add products

Remove products

Mark product as found

Navigate to product

Add product to cart

Example:

MY SHOPPING LIST

☐ Milk
☐ Bread
☑ Coffee
☐ Head & Shoulders

Buttons:

Navigate to Next Item
Optimize Route
Add All to Cart

Keep the shopping list synchronized with the backend where practical.

8. CART / LIVE BILL

Create a cart screen that resembles a real smart cart billing display.

Show:

Product
Quantity
Price
Subtotal

Example:

Milk — ₹65
Bread — ₹45
Coffee — ₹190
Head & Shoulders — ₹280

Subtotal: ₹580

Also show:

Items: 4
Total: ₹580

Allow:

Increase quantity

Decrease quantity

Remove item

The total must be calculated dynamically.

Include:

Continue Shopping
Scan Product
Checkout

The cart should persist during the session.

9. BARCODE SCAN

Create a barcode scanning screen designed for a physical scanner/camera.

For the current software prototype:

Provide a simulated barcode input field.

Allow entering a barcode/product ID.

Search the backend database.

Add the matching product to the cart.

Update the live bill.

Example:

Scan barcode:

8901234567890

→ Product found
→ Head & Shoulders
→ ₹280
→ Added to cart

Structure the code so that a physical USB/Bluetooth barcode scanner can later send barcode input to the application.

Do NOT require an actual camera scanner for the first prototype.

10. CHECKOUT

Create a simple checkout screen.

Show:

Shopping Summary

4 Items

Milk ₹65
Bread ₹45
Coffee ₹190
Head & Shoulders ₹280

Total: ₹580

Add a large:

Proceed to Checkout

For the prototype, clicking checkout should show:

"Checkout Ready"

"Your final bill is ₹580"

"Thank you for shopping with Waylo."

Do not implement a real payment gateway.

DATABASE DESIGN

Create a MySQL database with appropriate tables.

At minimum:

products

id

name

brand

category

description

price

barcode

aisle

shelf

availability

map_node_id

image_url

aisles

id

aisle_number

name

map information

map_nodes

id

x

y

node_type

map_edges

id

from_node

to_node

distance

shopping_lists

id

session_id

shopping_list_items

id

shopping_list_id

product_id

status

carts

id

session_id

total

cart_items

id

cart_id

product_id

quantity

price

Seed the database with at least 30 realistic supermarket products covering multiple categories and aisles.

Use realistic Indian product names/prices.

BACKEND API

Create REST endpoints similar to:

GET /api/products
GET /api/products/search?q=
GET /api/products/:id

GET /api/aisles
GET /api/map
GET /api/map/nodes
GET /api/map/edges

POST /api/navigation/route

POST /api/cart
GET /api/cart/:id
POST /api/cart/:id/items
PUT /api/cart/:id/items/:productId
DELETE /api/cart/:id/items/:productId

POST /api/shopping-list
GET /api/shopping-list/:id
POST /api/shopping-list/:id/items
DELETE /api/shopping-list/:id/items/:productId

POST /api/scan

POST /api/checkout

Use proper HTTP methods and JSON responses.

UI/UX REQUIREMENTS

The interface should look like a premium smart shopping cart, not a generic website.

Design requirements:

Large touch targets

Large readable fonts

Minimal typing

High contrast

Simple navigation

Clear current location

Clear destination

Clear route

Clear price

Persistent cart total

Bottom or side navigation suitable for a touchscreen

Main navigation:

Home | Search | List | Map | Cart

Keep the UI responsive so it works on:

Desktop

Tablet

7-inch touchscreen

Use subtle animations only where they improve usability.

Do not overload the UI with unnecessary cards, gradients, or decorative elements.

DEMO DATA

Create a sample supermarket called:

Waylo Mart

Use around 15–20 aisles.

Example products:

Milk

Bread

Eggs

Rice

Coffee

Biscuits

Chips

Soft Drinks

Shampoo

Head & Shoulders

Soap

Toothpaste

Detergent

Dishwash

Cooking Oil

Each product must have:

realistic price

aisle

shelf

barcode

map location

IMPORTANT DEMO SCENARIO

Make sure this exact scenario works smoothly:

User opens Waylo.

User searches "Head & Shoulders".

Product appears.

User opens product details.

Product shows:

₹280

Aisle 12

Shelf 3

In Stock

User clicks "Navigate".

Store map opens.

A* calculates a route from the current cart position to Aisle 12.

Route is highlighted.

User returns/searches for Milk and Bread.

User adds them to the shopping list.

User selects "Optimize Route".

Multi-product route is displayed.

User scans a product using the simulated barcode input.

Product is added to the cart.

Live bill updates.

User reaches checkout.

Final bill is displayed.

This complete flow must work without requiring manual code changes.

CODE QUALITY

Organize the project clearly:

frontend/
backend/

Use reusable React components.

Keep API calls separate from UI components where practical.

Use environment variables for:

database credentials

backend port

API URL

Include a README explaining:

Project overview

Tech stack

Frontend setup

Backend setup

MySQL setup

Database schema

How to run the application

How A* navigation works

How barcode scanning is currently simulated

How ESP32/BLE/RFID can be integrated later

Most importantly:

Make the current prototype fully functional first. Do not spend excessive effort on future hardware features before the core software flow works.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/fced6540-e495-4848-992b-d6754fe9ab20).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

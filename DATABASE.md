## Here is our database plan

### Microservice App for Multi-restaurant 

1. Users.   `done`
    1. Full name
    2. Email
    3. Password
    4. Reset token
    5. Mobile number
    6. User type
        1. Admin
        2. Merchant
    7. Ownership
        1. The id of the restaurant
        2. If admin then the id will be 0
2. Customer
    1. First name
    2. Last name
    3. Email
    4. Mobile number
    5. Address
    6. City 
    7. Country
    8. State
    9. Timestamps
3. Restaurant’s
    1. Name
    2. Address
    3. City
    4. Country 
    5. State
    6. Cuisine
    7. Uuid
        1. Based on this UUID we will save images of the restaurant in the system. 
4. Menu
    1. Name
    2. Description
    3. restaurant ID
5. Menu-Item
    1. Name
    2. Image
    3. Description
    4. Menu ID
    5. Price
    6. Uuid
    7. 
6. Orders
    1. Customer ID
    2. Order Status
        1. Currently we will have constants to help with this situation
    3. Subtotal
    4. Total
    5. last_update
7. Order Items
    1. Order Id
    2. Menu Item ID
    3. Quantity
    4. Price
    5. Special instructions
    6. Total
8. Order History
    1. Order Id
    2. Log
    3. Date and time

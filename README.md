# Stock-Discussion-Platform-Backend

## .env setup
#### Create a .env file, inside that -
      1. PORT = <Add port number (default is 3000)>
      2. DB_URL = <MongoDB URL with username and password included>
      3.JWT_SECRET = <Secret key to create and verify login tokens>
      4. CLOUDINARY_CLOUD_NAME = <Cloudinary name>
      5. CLOUDINARY_API_KEY = <Cloudinary API Key>
      6. CLOUDINARY_API_SECRET = <Cloudinary API Secret>

## Notes
      1. To handle images, I've used cloudinary to store the images and the link of the images are stored in database.
      2. Login tokens will be valid for 14 Hours
      3. Comments are stored in a diffecrent collection in data base
      4. Likes are stored in the post itself as array of user ID's
      5. Web socket not implemented
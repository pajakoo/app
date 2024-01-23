require("dotenv").config();
const express = require("express");
const cors = require("cors");
const passport = require("passport");
const authRoute = require("./routes/auth");
const cookieSession = require("cookie-session");
const passportStrategy = require("./passport");
const path = require('path');
const Product = require('./models/Product');
const Price = require('./models/Price');
const Store = require('./models/Store');
const Users = require('./models/Users');
const Role = require('./models/Role');

const { ObjectId } = require('mongodb');
const client  = require("./connectdb/client");
const dbName = process.env.DB_NAME;
const db = client.db(dbName);

const app = express();
app.use(express.json());



app.set("trust proxy", 1);


app.use(
    cookieSession({
        name: "session",
        keys: ["cyberwolve"],
        maxAge: 24 * 60 * 60 * 100,
    })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(
    cors({
        origin: process.env.CLIENT_URL,
        methods: "GET,POST,PUT,DELETE",
        credentials: true,
        domain: process.env.CLIENT_URL
    })
);

app.use("/auth", authRoute);



// API endpoint to create a new shopping list
app.post('/api/shopping-lists', async (req, res) => {
    const { userId, products } = req.body;
    await client.connect();
    console.log('zz', userId, products);

    try {
        const shoppingListData = {
            userId: new ObjectId(userId),
            products: products.map(product => ({
                productId: new ObjectId(product.productId),
                quantity: product.quantity || 1, // You can include quantity if needed
            })),
        };

        const result = await db.collection('shoppingLists').insertOne(shoppingListData);
        const createdList = await db.collection('shoppingLists').findOne({ _id: result.insertedId });

        res.status(201).json(createdList);
    } catch (error) {
        console.error('Error creating shopping list:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        await client.close();
    }
});

// API endpoint to get user-specific shopping lists
app.get('/api/shopping-lists/:userId', async (req, res) => {
    const { userId } = req.params;
    await client.connect();
    try {
        // Convert userId to ObjectId
        const userIdObject = new ObjectId(userId);

        // Assuming your 'shoppingLists' collection has the structure similar to the following
        const userLists = await db.collection('shoppingLists').find({ userId: userIdObject }).toArray();

        res.json(userLists);
    } catch (error) {
        console.error('Error fetching user shopping lists:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }  finally {
        await client.close();
    }
});

// API endpoint to update a shopping list
app.put('/api/shopping-lists/:listId', async (req, res) => {
    const { listId } = req.params;
    const { products } = req.body;
    await client.connect();

    try {
        const updatedList = await db.collection('shoppingLists').findOneAndUpdate(
            { _id: new ObjectId(listId) },
            { $set: { products: products.map(product => ({ productId: new ObjectId(product.productId), quantity: product.quantity })) } },
            { returnDocument: 'after' }
        );

        res.json(updatedList.value);
    } catch (error) {
        console.error('Error updating shopping list:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        await client.close();
    }
});

// API endpoint to delete a shopping list
app.delete('/api/shopping-lists/:listId', async (req, res) => {
    const { listId } = req.params;
    await client.connect();

    try {
        const result = await db.collection('shoppingLists').deleteOne({ _id: new ObjectId(listId) });

        if (result.deletedCount > 0) {
            res.json({ message: 'Shopping list deleted successfully' });
        } else {
            res.status(404).json({ error: 'Shopping list not found' });
        }
    } catch (error) {
        console.error('Error deleting shopping list:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        await client.close();
    }
});

// ... (existing code)


app.put('/api/users/:userId/roles', async (req, res) => {
    const { userId } = req.params;
    const { roles } = req.body;
    await client.connect();
    try {
        // Update user roles using updateOne
        const result = await db.collection('users').updateOne(
            { _id: new ObjectId(userId) },
            { $set: { roles } }
        );

        if (result.modifiedCount > 0) {
            // Find the updated user and return it
            const updatedUser = await db.collection('users').findOne({ _id: new ObjectId(userId) });
            res.json(updatedUser);
        } else {
            res.status(404).json({ error: 'User not found or roles not modified' });
        }
    } catch (error) {
        console.error('Error updating user roles:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/users', async (req, res) => {
    await client.connect();
    try {
        // Fetch all users from the 'users' collection in MongoDB
        const users = await db.collection('users').find().toArray();
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/profile', async (req, res) => {
    await client.connect();
  try {
    // Check if the user is authenticated
    if (req.isAuthenticated()) {
      // Retrieve the user information from the database based on user id
      console.log('gg:', req.user);
      const user = await db.collection('users').findOne({ googleId: req.user.id});

      if (user) {
        // Return the basic user information
        res.json({
          userId: user._id,
          email: user.email,
          picture:user.picture,
          name:user.name
          // Add other properties you want to include
        });
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } else {
      // Return an error if the user is not authenticated
      res.status(401).json({ error: 'Not authenticated' });
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await client.close();
    }
});

app.get('/api/userRoles', async (req, res) => {
    await client.connect();
    try {
        const rolesCollection = db.collection('role');

        const roles = await rolesCollection.find().toArray();
        res.json(roles);
    } catch (error) {
        console.error('Error fetching roles:', error);
        res.status(500).json({ error: 'Error fetching roles' });
    } finally {
        await client.close();
    }
});

app.post('/api/userInfo', async (req, res) => {
    const { user } = req.body;
    await client.connect();
    try {
        // Check if the user already exists in the database
        const existingUserCursor = await db.collection('users').find({ googleId: user.googleId });
        const existingUser = await existingUserCursor.next();

        if (!existingUser) {
            // If the user doesn't exist, create a new user
            const newUser = {
                sub: user.sub,
                name: user.name,
                email: user.email,
                roles: [new ObjectId('65660583e8d841f79b8fe615')]
            };

            // Insert the new user into the database
            await db.collection('users').insertOne(newUser);

            // Respond with user information
            res.json({
                sub: newUser.sub,
                name: user.name,
                email: newUser.email,
                roles: newUser.roles,
                // Add other fields as needed
            });
        } else {
            // If the user exists, respond with existing user information
            res.json({
                sub: existingUser.sub,
                name: user.name,
                email: existingUser.email,
                roles: existingUser.roles,
                // Add other fields as needed
            });
        }
    } catch (error) {
        console.error('Грешка при обработка на потребителската информация:', error.message);
        res.status(500).json({ error: 'Грешка при обработка на потребителската информация.' });
    }
});

app.get('/api/products', async (req, res) => {
    await client.connect();
    try {
        const collection = db.collection('products');
        const products = await collection.aggregate([
            {
                $lookup: {
                    from: 'prices',
                    localField: '_id',
                    foreignField: 'product',
                    as: 'priceData'
                }
            },
            {
                $unwind: {
                    path: '$priceData',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'stores',
                    localField: 'store',
                    foreignField: '_id',
                    as: 'storeData'
                }
            },
            {
                $unwind: {
                    path: '$storeData',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: 1,
                    barcode: 1,
                    name: 1,
                    location: 1,
                    store: '$storeData.name',
                    price: {
                        $ifNull: ['$priceData.price', '$price']
                    },
                    date: {
                        $ifNull: ['$priceData.date', null]
                    }
                }
            }
        ]).toArray();
        res.json(products);
    } catch (err) {
        console.error('Грешка при търсене на продуктите', err);
        res.status(500).json({ error: 'Възникна грешка' });
    }
});

app.get('/api/stores', async (req, res) => {
    await client.connect();
    try {
        const collection = db.collection('stores');
        const stores = await collection.find({}, { name: 1 }).toArray();
        res.json(stores);
    } catch (error) {
        console.error('Грешка при извличане на магазините:', error);
        res.status(500).json({ error: 'Възникна грешка при извличане на магазините' });
    }
});

app.get('/api/products-client', async (req, res) => {
    await client.connect();
    try {
        const collection = db.collection('products');
        const products = await collection.aggregate([
            {
                $lookup: {
                    from: 'prices',
                    localField: '_id',
                    foreignField: 'product',
                    as: 'priceData'
                }
            },
            {
                $unwind: {
                    path: '$priceData',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'stores',
                    localField: 'store',
                    foreignField: '_id',
                    as: 'storeData'
                }
            },
            {
                $unwind: {
                    path: '$storeData',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $group: {
                    _id: '$barcode',
                    product: { $first: '$$ROOT' }
                }
            },
            {
                $replaceRoot: {
                    newRoot: '$product'
                }
            },
            {
                $project: {
                    _id: 1,
                    barcode: 1,
                    name: 1,
                    location: 1,
                    storeId: '$storeData._id',
                    store: '$storeData.name',
                    price: {
                        $ifNull: ['$priceData.price', '$price']
                    },
                    date: {
                        $ifNull: ['$priceData.date', null]
                    }
                }
            }
        ]).toArray();
        res.json(products);
    } catch (err) {
        console.error('Грешка при търсене на продуктите', err);
        res.status(500).json({ error: 'Възникна грешка' });
    }
});

app.post('/api/cheapest', async (req, res) => {
    const productList = req.body;
    await client.connect();
    try {
        const storesCollection = db.collection('stores');
        const pricesCollection = db.collection('prices');

        // Find the stores that sell all of the products in the list
        const stores = await storesCollection.aggregate([
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: 'store',
                    as: 'products',
                },
            },
            {
                $match: {
                    'products.name': {
                        $in: productList.map((product) => product.name),
                    },
                },
            },
            {
                $addFields: {
                    products: {
                        $filter: {
                            input: '$products',
                            cond: { $in: ['$$this.name', productList.map((product) => product.name)] },
                        },
                    },
                },
            },
            {
                $match: {
                    $expr: { $eq: [{ $size: '$products' }, productList.length] },
                },
            },
        ]).toArray();

        // Find the prices for the products in the list and sort by date in descending order
        const prices = await pricesCollection
            .find({
                product: {
                    $in: productList.map((product) => product.id),
                },
            })
            .sort({ date: -1 })
            .toArray();

        // Group prices by store and get the latest date for each store
        const groupedPrices = {};
        prices.forEach((price) => {
            const storeId = price.store.toString();
            if (!groupedPrices[storeId] || price.date > groupedPrices[storeId].date) {
                groupedPrices[storeId] = price;
            }
        });

        // Calculate the total price for each store using the most up-to-date price
        const storePrices = stores.map((store) => {
            const storeProducts = store.products;
            const price = groupedPrices[store._id.toString()];
            const productPrices = price ? price.prices : [];
            const totalPrice = productList.reduce((acc, product) => {
                const storeProduct = storeProducts.find((p) => p.name === product.name);
                const productPrice = productPrices.find((p) => p.product.toString() === product.id.toString());
                const priceValue = productPrice ? productPrice.price : storeProduct ? storeProduct.price : 0;
                return acc + Number(priceValue);
            }, 0);

            return {
                storeId: store._id,
                store: store.name,
                latitude: store.location.lat,
                longitude: store.location.lng,
                totalPrice,
            };
        });

        // Sort the store prices by total price
        storePrices.sort((a, b) => a.totalPrice - b.totalPrice);

        res.json(storePrices);
    } catch (error) {
        console.error('Error finding the cheapest prices:', error);
        res.status(500).json({ error: 'An error occurred while finding the cheapest prices' });
    }
});

app.get('/api/searchProduct', async (req, res) => {
    const { code } = req.query;
    await client.connect();
    try {
        // Make the request to the external API
        const response = await axios.get(`https://barcode.bazadanni.com/json/${code}`);
        res.json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/product/:barcode/prices/:storeId', async (req, res) => {
    const { barcode, storeId } = req.params;
    await client.connect();
    try {
        const product = await db.collection('products').findOne({ barcode, store: new ObjectId(storeId) });

        if (!product) {
            return res.status(404).json({ message: 'Продуктът не е намерен' });
        }

        const prices = await db.collection('prices').find({ product: product._id }).toArray();

        res.json(prices);
    } catch (error) {
        console.error('Грешка при извличане на цените за продукта:', error);
        res.status(500).json({ message: 'Възникна грешка при извличане на цените за продукта' });
    }
});

app.get('/api/product/:barcode/history', async (req, res) => {
    const { barcode } = req.params;
    await client.connect();
    try {
        const products = await db.collection('products').find({ barcode }).toArray();

        if (products.length === 0) {
            return res.status(404).json({ message: 'Продуктите не са намерени' });
        }

        const productIds = products.map((product) => product._id);

        const prices = await db.collection('prices').find({ product: { $in: productIds } }).toArray();

        res.json(prices);
    } catch (error) {
        console.error('Грешка при намиране на ценовата история:', error);
        res.status(500).json({ message: 'Възникна грешка при намиране на ценовата история' });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    const productId = req.params.id;
    await client.connect();
    try {
        const db = client.db('ShoppingApp');

        // Delete the product
        await db.collection('products').deleteOne({ _id: new ObjectId(productId) });

        // Delete the associated price
        await db.collection('prices').deleteOne({ product: new ObjectId(productId) });

        res.json({ message: 'Продуктът и свързаната цена са изтрити успешно' });
    } catch (error) {
        console.error('Грешка при изтриване на продукта и цената:', error);
        res.status(500).json({ message: 'Възникна грешка при изтриване на продукта и цената' });
    }
});

app.get('/api/products/:barcode', async (req, res) => {
    await client.connect();
    try {
        const product = await db.collection('products').findOne({ barcode: req.params.barcode });

        if (!product) {
            return res.status(404).json({ message: 'Продуктът не е намерен' });
        }

        res.json(product);
    } catch (error) {
        console.error('Грешка при намиране на продукта:', error);
        res.status(500).json({ message: 'Възникна грешка при намиране на продукта' });
    }
});

app.post('/api/products', async (req, res) => {
    const { barcode, name, price, store, location } = req.body;
    await client.connect();
    try {
        const collection = db.collection('products');

        const existingStore = await db.collection('stores').findOne({ name: store });

        if (existingStore) {
            const existingProduct = await collection.findOne({ barcode, store: existingStore._id });

            if (existingProduct) {
                existingProduct.price = price;
                existingProduct.location = location;
                await collection.updateOne({ _id: existingProduct._id }, { $set: existingProduct });

                const priceData = {
                    store: existingProduct.store,
                    product: existingProduct._id,
                    date: Date.now(),
                    price: existingProduct.price
                };
                await db.collection('prices').insertOne(priceData);

                res.json({ message: 'Продуктът е обновен успешно' });
            } else {
                const productData = {
                    barcode,
                    name,
                    price,
                    store: existingStore._id,
                    location
                };
                await collection.insertOne(productData);

                const priceData = {
                    store: existingStore._id,
                    product: productData._id,
                    date: Date.now(),
                    price: productData.price
                };
                await db.collection('prices').insertOne(priceData);

                res.status(201).json({ message: 'Продуктът е успешно създаден' });
            }
        } else {
            const storeData = {
                name: store,
                location
            };
            const newStore = await db.collection('stores').insertOne(storeData);

            const productData = {
                barcode,
                name,
                price,
                store: newStore.insertedId,
                location
            };
            await collection.insertOne(productData);

            const priceData = {
                store: newStore.insertedId,
                product: productData._id,
                date: Date.now(),
                price: productData.price
            };
            await db.collection('prices').insertOne(priceData);

            res.status(201).json({ message: 'Продуктът е успешно създаден' });
        }
    } catch (error) {
        console.error('Грешка при създаване/обновяване на продукта:', error);
        res.status(500).json({ message: 'Възникна грешка при създаване/обновяване на продукта' });
    }
});



const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Listenting on port ${port}...`));


 
// Assuming your static files are in the 'build' directory inside 'price-hunter'
const staticFilesPath = path.join(__dirname, '..', 'price-hunter', 'build');

app.use(express.static(staticFilesPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(staticFilesPath, 'index.html'));
});










// // {
// //     "dependencies": {
// //       "cookie-session": "^2.0.0",
// //       "cors": "^2.8.5",
// //       "dotenv": "^16.3.1",
// //       "express": "^4.18.2",
// //       "jsonwebtoken": "^9.0.2",
// //       "passport": "^0.5.2",
// //       "passport-google-oauth20": "^2.0.0"
// //     }
// //   }
  





// const express = require('express');
// const cors = require("cors");
// const passport = require('passport');
// const cookieSession = require("cookie-session");
// const GoogleStrategy = require('passport-google-oauth20').Strategy;
// const jwt = require('jsonwebtoken');
// require("dotenv").config();
// const app = express();
// const PORT = process.env.PORT || 3000;



// const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// //const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_CONNECTION}@cluster0.udwqatw.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
// const uri = "mongodb://localhost:27017/"

// // Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(uri, {
//     serverApi: {
//         version: ServerApiVersion.v1,
//         strict: true,
//         deprecationErrors: true,
//         useNewUrlParser: true, //?????
//         useUnifiedTopology: true //?????
//     }
// });

// async function run() {
//     try {
//         // Connect the client to the server	(optional starting in v4.7)
//         await client.connect();
//         // Send a ping to confirm a successful connection
//         await client.db("admin").command({ ping: 1 });
//         console.log("Pinged your deployment. You successfully connected to MongoDB!");
//     } finally {
//         // Ensures that the client will close when you finish/error
//         await client.close();
//     }
// }
// run().catch(console.dir);


// const dbName = process.env.DB_NAME;
// const db = client.db(dbName);



// app.use(express.json());
// app.use(passport.initialize());

// app.use(
// 	cookieSession({
// 		name: "session",
// 		keys: ["cyberwolve"],
// 		maxAge: 24 * 60 * 60 * 100,
// 	})
// );

// app.use(passport.initialize());
// app.use(passport.session());


// app.use(
// 	cors({
// 		origin: process.env.CLIENT_URL,
// 		methods: "GET,POST,PUT,DELETE",
// 		credentials: true,
// 	})
// );

// passport.use(new GoogleStrategy({
//   clientID:  process.env.GOOGLE_CLIENT_ID,
//   clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//   callbackURL: 'http://localhost:3333/auth/google/callback',
// }, (accessToken, refreshToken, profile, done) => {
//   return done(null, profile);
// }));

// // Serialize user into JWT
// passport.serializeUser((user, done) => {
//   const token = jwt.sign(user, process.env.JWT_SECRET);
//   done(null, token);
// });

// // Use the JWT token for subsequent requests
// passport.deserializeUser((token, done) => {
//   jwt.verify(token,  process.env.JWT_SECRET, (err, decoded) => {
//     done(null, decoded);
//   });
// });

// // Google OAuth route
// app.get('/auth/google',
//   passport.authenticate('google', { scope: ['profile', 'email'] })
// );

// // Google OAuth callback
// app.get('/auth/google/callback',
//   passport.authenticate('google', { failureRedirect: '/' , successRedirect: process.env.CLIENT_URL}),
//   (req, res) => {
//     res.redirect('/profile'); // Redirect to profile route
//   }
// );

// // Profile route to demonstrate authentication
// app.get('/api/profile', (req, res) => {
//   res.json(req.user);
// });

// // app.get('/api/users', async (req, res) => {
// //     await client.connect();
// //     try {
// //         // Fetch all users from the 'users' collection in MongoDB
// //         const users = await db.collection('users').find().toArray();
// //         res.json(users);
// //     } catch (error) {
// //         console.error('Error fetching users:', error.message);
// //         res.status(500).json({ error: 'Internal Server Error' });
// //     }
// // });

// app.get('/api/stores', async (req, res) => {
//     await client.connect();
//     try {
//         const collection = db.collection('stores');
//         const stores = await collection.find({}, { name: 1 }).toArray();
//         res.json(stores);
//     } catch (error) {
//         console.error('Грешка при извличане на магазините:', error);
//         res.status(500).json({ error: 'Възникна грешка при извличане на магазините' });
//     }
// });

// // API endpoint to get user-specific shopping lists
// app.get('/api/shopping-lists/:userId', async (req, res) => {
//     const { userId } = req.params;
//     await client.connect();
// console.log('ggggg',userId);
//     try {
//         const userLists = await db.collection('shoppingLists').find({ userId: new ObjectId(userId) }).toArray();
//         res.json(userLists);
//     } catch (error) {
//         console.error('Error fetching user shopping lists:', error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     } finally {
//         await client.close();
//     }
// });

// app.get('/api/products-client', async (req, res) => {
//     await client.connect();
//     try {
//         const collection = db.collection('products');
//         const products = await collection.aggregate([
//             {
//                 $lookup: {
//                     from: 'prices',
//                     localField: '_id',
//                     foreignField: 'product',
//                     as: 'priceData'
//                 }
//             },
//             {
//                 $unwind: {
//                     path: '$priceData',
//                     preserveNullAndEmptyArrays: true
//                 }
//             },
//             {
//                 $lookup: {
//                     from: 'stores',
//                     localField: 'store',
//                     foreignField: '_id',
//                     as: 'storeData'
//                 }
//             },
//             {
//                 $unwind: {
//                     path: '$storeData',
//                     preserveNullAndEmptyArrays: true
//                 }
//             },
//             {
//                 $group: {
//                     _id: '$barcode',
//                     product: { $first: '$$ROOT' }
//                 }
//             },
//             {
//                 $replaceRoot: {
//                     newRoot: '$product'
//                 }
//             },
//             {
//                 $project: {
//                     _id: 1,
//                     barcode: 1,
//                     name: 1,
//                     location: 1,
//                     storeId: '$storeData._id',
//                     store: '$storeData.name',
//                     price: {
//                         $ifNull: ['$priceData.price', '$price']
//                     },
//                     date: {
//                         $ifNull: ['$priceData.date', null]
//                     }
//                 }
//             }
//         ]).toArray();
//         res.json(products);
//     } catch (err) {
//         console.error('Грешка при търсене на продуктите', err);
//         res.status(500).json({ error: 'Възникна грешка' });
//     }
// });


// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });

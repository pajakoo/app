import express from 'express';
import {Types,mongoose} from 'mongoose';
import dotenv from 'dotenv';
import userRouter from './routes/user.route.js';
import authRouter from './routes/auth.route.js';
import listingRouter from './routes/listing.route.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';

import Store from './models/store.js';
import User from './models/user.js';
import Product from './models/product.js';
import Price from './models/price.js';
import Role from './models/role.js';
import ShoppingList from './models/shoppinglist.js';

dotenv.config(); 

mongoose
  .connect(process.env.DB_CLIENT_URL)
  .then(() => {
    console.log('Connected to MongoDB!');
  })
  .catch((err) => {
    console.log(err);
  });

  const __dirname = path.resolve();

const app = express();

app.use(express.json());

app.use(cookieParser());


app.use(
	cors('*')
);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

app.use('/api/user', userRouter);
app.use('/api/auth', authRouter);
app.use('/api/listing', listingRouter);



// API endpoint to update a shopping list
app.put('/api/shopping-lists/:listId', async (req, res) => {
  const { listId } = req.params;
  const { products } = req.body;
 

  try {
      const updatedList = await db.collection('shoppingLists').findOneAndUpdate(
          { _id: new Types.ObjectId(listId) },
          { $set: { products: products.map(product => ({ productId: new Types.ObjectId(product.productId), quantity: product.quantity })) } },
          { returnDocument: 'after' }
      );

      res.json(updatedList.value);
  } catch (error) {
      console.error('Error updating shopping list:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  } 
});
// API endpoint to delete a shopping list by ID
app.delete('/api/shopping-lists/:listId', async (req, res) => {
    const { listId } = req.params;
  
    try {
      // Delete the shopping list using ShoppingList model
      const result = await ShoppingList.deleteOne({ _id: new Types.ObjectId(listId) });
  
      if (result.deletedCount > 0) {
        // Shopping list deleted successfully
        res.json({ message: 'Shopping list deleted successfully' });
      } else {
        // Shopping list not found with the given ID
        res.status(404).json({ error: 'Shopping list not found' });
      }
    } catch (error) {
      console.error('Error deleting shopping list:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

// API endpoint to get all shopping lists
app.get('/api/shopping-lists', async (req, res) => {
    try {
        // Fetch all shopping lists from the database
        const allShoppingLists = await ShoppingList.find({}).exec();
        // Return the array of shopping lists
        res.json(allShoppingLists);
    } catch (error) {
        console.error('Error fetching shopping lists:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

 

app.get('/api/shopping-lists/random', async (req, res) => {
    try {
        // Fetch random shopping lists from the database
        const randomLists = await ShoppingList.aggregate([
            { $sample: { size: 3 } } // Get 3 random documents
        ]);

        // Create an array to store the random shopping list details with product names
        const randomShoppingLists = [];

        // Loop through each random shopping list
        for (const list of randomLists) {
            const productList = [];

            // Loop through each product in the shopping list
            for (const product of list.products) {
                if (product.productId) {
                    // Fetch product details in the productList array
                    const productDetails = await Product.findById(product.productId);
                    if (productDetails) {
                        productList.push({
                            productId: productDetails._id,
                            name: productDetails.name,
                            quantity: product.quantity,
                            // Include other product details if needed
                        });
                    }
                }
            }

            // Include random shopping list details with product names in the response
            randomShoppingLists.push({
                listId: list._id,
                products: productList,
                listName: list.listName,
                createdAt: list.createdAt,
                updatedAt: list.updatedAt,
                // Include other shopping list details if needed
            });
        }

        res.json(randomShoppingLists);
    } catch (error) {
        console.error('Error fetching random shopping lists:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

  




app.get('/api/products-client', async (req, res) => {
 
  try {
      const products = await Product.aggregate([
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
      ]).exec();
      // console.log(products);   aggregate().explain("executionStats"); //for stats of the query
   
      res.json(products);
  } catch (err) {
      console.error('Грешка при търсене на продуктите', err);
      res.status(500).json({ error: 'Възникна грешка' });
  } 
});

app.get('/api/searchProduct', async (req, res) => {
  const { code } = req.query;
 
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
 
  try {
      const product = await Product.findOne({ barcode, store: new Types.ObjectId(storeId) });

      if (!product) {
          return res.status(404).json({ message: 'Продуктът не е намерен' });
      }

      const prices = await Price.find({ product: product._id }).exec();

      res.json(prices);
  } catch (error) {
      console.error('Грешка при извличане на цените за продукта:', error);
      res.status(500).json({ message: 'Възникна грешка при извличане на цените за продукта' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  const productId = req.params.id;
  try {
      await Product.deleteOne({ _id: new Types.ObjectId(productId) });
      await Price.deleteOne({ product: new Types.ObjectId(productId) });
      res.json({ message: 'Продуктът и свързаната цена са изтрити успешно' });
  } catch (error) {
      console.error('Грешка при изтриване на продукта и цената:', error);
      res.status(500).json({ message: 'Възникна грешка при изтриване на продукта и цената' });
  }
});

app.get('/api/products/:barcode', async (req, res) => {
 
  try {
      const product = await Product.findOne({ barcode: req.params.barcode });

      if (!product) {
          return res.status(404).json({ message: 'Продуктът не е намерен' });
      }

      res.json(product);
  } catch (error) {
      console.error('Грешка при намиране на продукта:', error);
      res.status(500).json({ message: 'Възникна грешка при намиране на продукта' });
  }
});






app.get('/api/stores', async (req, res) => {
 
  try {
      const stores = await Store.find({}, { name: 1 }).exec();
      res.json(stores);
  } catch (error) {
      console.error('Грешка при извличане на магазините:', error);
      res.status(500).json({ error: 'Възникна грешка при извличане на магазините' });
  }
});

app.post('/api/products', async (req, res) => {
    const { barcode, name, price, store, location, userId } = req.body;

    try {
        // Check if the store exists
        let existingStore = await Store.findOne({ name: { $regex: new RegExp(store, 'i') } });

        if (!existingStore) {
            // If store doesn't exist, create a new one
            const newStore = new Store({
                name: store,
                location: { lat: 0, lng: 0 } // Set default location or use the location from req.body
            });

            existingStore = await newStore.save();
        }

        // Check if the product already exists in the store
        const existingProduct = await Product.findOne({ barcode, store: existingStore._id });

        if (existingProduct) {
            // Check if the product was added by the current user
            if (existingProduct.addedBy.toString() !== addedBy) {
                return res.status(403).json({ message: 'Нямате права да обновявате този продукт.' });
            }

            // Update existing product
            existingProduct.price = price;
            existingProduct.location = location;

            await existingProduct.save();

            // Insert new price data
            const priceData = new Price({
                store: existingProduct.store,
                product: existingProduct._id,
                date: Date.now(),
                price: existingProduct.price
            });

            await priceData.save();

            res.json({ message: 'Продуктът е обновен успешно' });
        } else {
            // Create a new product
            const newProduct = new Product({
                barcode,
                name,
                price,
                store: existingStore._id,
                location,
                addedBy:new Types.ObjectId(userId) // Use Mongoose.Types.Types.ObjectId to create Types.ObjectId
            });

            await newProduct.save();

            // Insert new price data
            const priceData = new Price({
                store: existingStore._id,
                product: newProduct._id,
                date: Date.now(),
                price: newProduct.price
            });

            await priceData.save();

            res.status(201).json({ message: 'Продуктът е успешно създаден' });
        }
    } catch (error) {
        console.error('Грешка при създаване/обновяване на продукта:', error);
        res.status(500).json({ message: 'Възникна грешка при създаване/обновяване на продукта', error: error.message });
    }
});

 

app.get('/api/products', async (req, res) => {
    const { addedBy } = req.query;
    
    try {
        const products = await Product.aggregate([
            {
                $match: { addedBy: new Types.ObjectId(addedBy)  }
            },
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
        ]).exec();

        res.json(products);
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ error: 'An error occurred' });
    }
});

  

  

app.get('/api/product/:barcode/history', async (req, res) => {
    const { barcode } = req.params;
   
    try {
        const products = await Product.find({ barcode }).exec();
  
        if (products.length === 0) {
            return res.status(404).json({ message: 'Продуктите не са намерени' });
        }
  
        const productIds = products.map((product) => product._id);
  
        const prices = await Price.find({ product: { $in: productIds } }).exec();
  
        res.json(prices);
    } catch (error) {
        console.error('Грешка при намиране на ценовата история:', error);
        res.status(500).json({ message: 'Възникна грешка при намиране на ценовата история' });
    }
});

app.post('/api/cheapest', async (req, res) => {
    const productList = req.body;
   
    try {
  
        // Find the stores that sell all of the products in the list
        const stores = await Store.aggregate([
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
        ]).exec();
  
        // Find the prices for the products in the list and sort by date in descending order
        const prices = await Price
            .find({
                product: {
                    $in: productList.map((product) => product.id),
                },
            })
            .sort({ date: -1 })
            .exec();
  
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


//TODO user sorts the products by priority
// app.post('/api/cheapest', async (req, res) => {
//     const productList = req.body;
  
//     try {
//       // Store missing products for each store
//       const missingProductsByStore = {};
  
//       // Find stores with matching products, regardless of quantity
//       const stores = await Store.aggregate([
//         {
//           $lookup: {
//             from: 'products',
//             localField: '_id',
//             foreignField: 'store',
//             as: 'products',
//           },
//         },
//         {
//           $match: {
//             'products.name': {
//               $in: productList.map((product) => product.name),
//             },
//           },
//         },
//         {
//           $addFields: {
//             products: {
//               $filter: {
//                 input: '$products',
//                 cond: { $in: ['$$this.name', productList.map((product) => product.name)] },
//               },
//             },
//           },
//         },
//       ]).exec();
  
//       // Find prices for products in the list, sorted by date
//       const prices = await Price
//         .find({
//           product: {
//             $in: productList.map((product) => product.id),
//           },
//         })
//         .sort({ date: -1 })
//         .exec();
  
//       // Group prices by store and get the latest date for each store
//       const groupedPrices = {};
//       prices.forEach((price) => {
//         const storeId = price.store.toString();
//         if (!groupedPrices[storeId] || price.date > groupedPrices[storeId].date) {
//           groupedPrices[storeId] = price;
//         }
//       });
  
//       // Calculate total prices, track missing products per store, and build response
//       const storePrices = stores.map((store) => {
//         const storeProducts = store.products;
//         const price = groupedPrices[store._id.toString()];
//         const productPrices = price ? price.prices : [];
//         const totalPrice = productList.reduce((acc, product) => {
//           const storeProduct = storeProducts.find((p) => p.name === product.name);
//           const productPrice = productPrices.find((p) => p.product.toString() === product.id.toString());
//           const priceValue = productPrice ? productPrice.price : storeProduct ? storeProduct.price : 0;
//           if (!priceValue) {
//             // Add missing product details to relevant store's array
//             if (!missingProductsByStore[store._id]) {
//               missingProductsByStore[store._id] = [];
//             }
//             missingProductsByStore[store._id].push(product);
//           }
//           return acc + Number(priceValue);
//         }, 0);
  
//         return {
//           storeId: store._id,
//           store: store.name,
//           latitude: store.location.lat,
//           longitude: store.location.lng,
//           totalPrice,
//           missingProducts: missingProductsByStore[store._id] || [],
//         };
//       });
  
//       // Sort store prices by total price
//       storePrices.sort((a, b) => a.totalPrice - b.totalPrice);
  
//       // Send response with store prices and missing products for each store
//       res.json({ storePrices });
//     } catch (error) {
//       console.error('Error finding the cheapest prices:', error);
//       res.status(500).json({ error: 'An error occurred while finding the cheapest prices' });
//     }
//   });

app.get('/api/users', async (req, res) => {
 
  try {
      // Fetch all users from the 'users' collection in MongoDB
      const users = await User.find().exec();
      res.json(users);
  } catch (error) {
      console.error('Error fetching users:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.put('/api/users/:userId/roles', async (req, res) => {
  const { userId } = req.params;
  const { roles } = req.body;
 
  try {
      // Update user roles using updateOne
      const result = await User.updateOne(
          { _id: new Types.ObjectId(userId) },
          { $set: { roles } }
      );

      if (result.modifiedCount > 0) {
          // Find the updated user and return it
          const updatedUser = await User.findOne({ _id: new Types.ObjectId(userId) });
          res.json(updatedUser);
      } else {
          res.status(404).json({ error: 'User not found or roles not modified' });
      }
  } catch (error) {
      console.error('Error updating user roles:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/userRoles', async (req, res) => {
 
  try {
      const roles = await Role.find().exec();
      res.json(roles);
  } catch (error) {
      console.error('Error fetching roles:', error);
      res.status(500).json({ error: 'Error fetching roles' });
  } 
});

// API endpoint to create a new shopping list
app.post('/api/shopping-lists', async (req, res) => {
    const { userId, products, listName } = req.body;
   
    console.log('zz', userId, products);
  
    try {
        const shoppingListData = {
            userId: new Types.ObjectId(userId),
            listName:listName,
            products: products.map(product => ({
                productId: new Types.ObjectId(product.productId),
                quantity: product.quantity || 1, // You can include quantity if needed
            })),
        };
  
        // Use create instead of insertOne
        const createdList = await ShoppingList.create(shoppingListData);
  
        res.status(201).json(createdList);
    } catch (error) {
        console.error('Error creating shopping list:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    } 
  });
  
// API endpoint to get user-specific shopping lists with product details
app.get('/api/shopping-lists/:userId', async (req, res) => {
    const { userId } = req.params;
  
    try {
      // Convert userId to Types.ObjectId
      const userIdObject = new Types.ObjectId(userId);
  
      // Fetch user-specific shopping lists
      const userLists = await ShoppingList.find({ userId: userIdObject }).exec();
  
      // Create an array to store the shopping list details with product names
      const shoppingListDetails = [];
  
      // Loop through each shopping list
      for (const list of userLists) {
        const productList = [];
  
        // Loop through each product in the shopping list
        for (const product of list.products) {
          // Fetch product details based on product ID or barcode
          const productDetails = await Product.findOne({
            $or: [
              { _id: product.productId }, // Assuming product.productId is the product ID
              { barcode: product.barcode }, // Assuming product.barcode is the barcode
            ],
          }).exec();
  
          if (productDetails) {
            // Include product details in the productList array
            productList.push({
                productId:productDetails._id,
                name: productDetails.name,
                quantity: product.quantity,
                //Include other product details if needed
            });
          }
        }
  
        // Include shopping list details with product names in the response
        shoppingListDetails.push({
          listId: list._id,
          products: productList,
          listName:list.listName,
          createdAt: list.createdAt,
          updatedAt: list.updatedAt,
          // Include other shopping list details if needed
        });
      }
  
      res.json(shoppingListDetails);
    } catch (error) {
      console.error('Error fetching user shopping lists:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  

app.use(express.static(path.join(__dirname, '/price-hunter/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'price-hunter', 'build', 'index.html'));
})

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});


// import express from 'express';
// import mongoose from 'mongoose';
// import dotenv from 'dotenv';
// import userRouter from './routes/user.route.js';
// import authRouter from './routes/auth.route.js';
// import listingRouter from './routes/listing.route.js';
// import cookieParser from 'cookie-parser';
// import path from 'path';
// dotenv.config();

// mongoose
//   .connect('mongodb://localhost:27017')
//   .then(() => {
//     console.log('Connected to MongoDB!');
//   })
//   .catch((err) => {
//     console.log(err);
//   });

//   const __dirname = path.resolve();

// const app = express();

// app.use(express.json());

// app.use(cookieParser());

// app.listen(3000, () => {
//   console.log('Server is running on port 3000!');
// });

// app.use('/api/user', userRouter);
// app.use('/api/auth', authRouter);
// app.use('/api/listing', listingRouter);


// app.use(express.static(path.join(__dirname, '/client/dist')));

// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
// })

// app.use((err, req, res, next) => {
//   const statusCode = err.statusCode || 500;
//   const message = err.message || 'Internal Server Error';
//   return res.status(statusCode).json({
//     success: false,
//     statusCode,
//     message,
//   });
// });

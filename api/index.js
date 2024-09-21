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
      // Delete the shopping list using findByIdAndDelete
      const result = await ShoppingList.findByIdAndDelete(listId);

      if (result) {
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
            { $sample: { size: 3 } } 
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
            as: 'priceData',
          },
        },
        {
          $unwind: {
            path: '$priceData',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'stores',
            localField: 'priceData.store',
            foreignField: '_id',
            as: 'storeData',
          },
        },
        {
          $unwind: {
            path: '$storeData',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $group: {
            _id: '$barcode',
            product: { $first: '$$ROOT' },
          },
        },
        {
          $replaceRoot: {
            newRoot: '$product',
          },
        },
        {
          $project: {
            _id: 1,
            barcode: 1,
            name: 1,
            location: '$priceData.location',
            storeId: '$storeData._id',
            store: '$storeData.name',
            price: {
              $ifNull: ['$priceData.price', '$price'],
            },
            date: {
              $ifNull: ['$priceData.date', null],
            },
          },
        },
      ]);
  
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
    // Step 1: Find the prices based on the barcode and storeId
    const prices = await Price.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      {
        $unwind: '$productDetails'
      },
      {
        $match: {
          'productDetails.barcode': barcode,
          store: new Types.ObjectId(storeId)
        }
      },
      {
        $lookup: {
          from: 'stores',
          localField: 'store',
          foreignField: '_id',
          as: 'storeDetails'
        }
      },
      {
        $unwind: '$storeDetails'
      }
    ]);

    // If no prices found, return a 404 error
    if (!prices.length) {
      return res.status(404).json({ message: 'No prices found for the given barcode and store', status: false });
    }


    // Format prices before returning them
    const formattedPrices = prices.map((price) => ({
      ...price._doc, // Use _doc to get raw document data in Mongoose
      price: parseFloat(price.price.toString()).toFixed(2), // Convert Decimal128 to number and round to 2 decimal places
    }));

    res.json(formattedPrices);


    // res.json(prices);
  } catch (error) {
    console.error('Error fetching prices for the product:', error);
    res.status(500).json({ message: 'An error occurred while fetching prices for the product' });
  }
});



app.delete('/api/user/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await Price.deleteMany({ addedBy: userId });
    await Product.deleteMany({ addedBy: userId });
    await Store.deleteMany({ addedBy: userId });
    await User.findByIdAndDelete(userId);
    await ShoppingList.deleteMany({userId:userId});

    res.status(200).json({ message: 'User, stores, products, and associated data deleted successfully' });
  } catch (error) {
    console.error('Error during user deletion:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});


app.delete('/api/products/:id', async (req, res) => {
  const productId = req.params.id;

  try {
    // Step 1: Find all prices associated with this product
    const prices = await Price.find({ product: new Types.ObjectId(productId) });

    if (prices.length > 0) {
      // Step 2: Collect all store IDs from the prices related to this product
      const storeIds = prices.map(price => price.store);

      // Step 3: Delete all prices related to the product
      await Price.deleteMany({ product: new Types.ObjectId(productId) });

      // Step 4: For each store ID, check if the store is associated with any other products
      for (const storeId of storeIds) {
        const remainingPrices = await Price.find({ store: storeId });
        if (remainingPrices.length === 0) {
          // No more prices associated with this store, so we can delete the store
          await Store.deleteOne({ _id: storeId });
        }
      }
    }

    // Step 5: Delete the product itself
    await Product.deleteOne({ _id: new Types.ObjectId(productId) });

    res.json({ message: 'Продуктът и свързаните документи са изтрити успешно' });
  } catch (error) {
    console.error('Грешка при изтриване на продукта и свързаните документи:', error);
    res.status(500).json({ message: 'Възникна грешка при изтриване на продукта и свързаните документи' });
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




app.get('/api/products/stores/:productId', async (req, res) => {
  const { productId } = req.params;

  try {
    // Step 1: Find the product by ID to get the barcode
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Step 2: Find all prices associated with this product's barcode
    const prices = await Price.find({ barcode: product.barcode }).populate('store');
    if (!prices.length) {
      return res.status(404).json({ error: 'No prices found for this product' });
    }
    // Step 3: Extract unique stores from the prices
    const stores = prices.map(price => price.store);
    
    // Remove duplicates if necessary
    const uniqueStores = Array.from(new Set(stores.map(store => store._id)))
      .map(id => {
        return stores.find(store => store._id.equals(id));
      });

    // Return the list of stores
    res.json(uniqueStores);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
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
    // Check if the store exists based on store name (case-insensitive)
    let existingStore = await Store.findOne({ name: { $regex: new RegExp(store, 'i') } });

    if (!existingStore) {
      // If the store doesn't exist, create a new one
      const newStore = new Store({
        name: store,
        addedBy: new Types.ObjectId(userId), // Adding userId as addedBy
        location: location || { lat: 0, lng: 0 }, // Either use provided location or default
      });

      existingStore = await newStore.save(); // Save the new store
    }

    // Check if the product already exists by barcode
    const existingProduct = await Product.findOne({ barcode });

    if (existingProduct) {
      // Update existing product
      existingProduct.name = name;
      existingProduct.addedBy = new Types.ObjectId(userId); // Ensure addedBy is set to the current user
      await existingProduct.save(); // Save updated product details

      // Insert new price for the existing product
      const priceData = new Price({
        store: existingStore._id, // Store reference
        product: existingProduct._id, // Product reference
        date: Date.now(),
        addedBy: new Types.ObjectId(userId), // AddedBy reference
        barcode: barcode,
        location: location, // Ensure the location is included
        price: price,
      });

      await priceData.save(); // Save the price entry
      res.json({ message: 'Product updated successfully' });
    } else {
      // Create a new product if it doesn't exist
      const newProduct = new Product({
        barcode: barcode,
        name: name,
        addedBy: new Types.ObjectId(userId), // Ensure the user who added the product is recorded
      });

      await newProduct.save(); // Save the new product

      // Insert the price for the new product
      const priceData = new Price({
        store: existingStore._id, // Reference to the store
        product: newProduct._id, // Reference to the newly created product
        date: Date.now(),
        price: price,
        location: location, // Location data
        barcode: barcode,
        addedBy: new Types.ObjectId(userId), // Reference to the user who added the product
      });

      await priceData.save(); // Save the price entry
      res.status(201).json({ message: 'Product created successfully' });
    }
  } catch (error) {
    console.error('Error creating/updating product:', error);
    res.status(500).json({
      message: 'An error occurred while creating/updating the product',
      error: error.message,
    });
  }
});





app.get('/api/products', async (req, res) => {
  const { addedBy } = req.query;

  try {
    // Aggregate prices to get products and their price details added by the specified user
    const productsWithPrices = await Price.aggregate([
      { $match: { addedBy: new Types.ObjectId(addedBy) } }, // Filter prices by user
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: '$productDetails' }, // Unwind product details array
      {
        $lookup: {
          from: 'stores',
          localField: 'store',
          foreignField: '_id',
          as: 'storeDetails'
        }
      },
      { $unwind: '$storeDetails' }, // Unwind store details array
      {
        $group: {
          _id: '$productDetails.barcode', // Group by barcode
          productDetails: { $first: '$productDetails' }, // Get product details
          prices: {
            $push: {
              priceId: '$_id', // Include price _id for deletion
              price: '$price',
              date: '$date',
              store: {
                storeId: '$storeDetails._id',
                name: '$storeDetails.name',
                location: '$location'
              }
            }
          }
        }
      },
      {
        $project: {
          _id: '$productDetails._id',
          barcode: '$_id', // Use the grouped barcode
          name: '$productDetails.name',
          prices: 1
        }
      }
    ]);

    res.json(productsWithPrices);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'An error occurred' });
  }
});
 

app.delete('/api/prices/:priceId', async (req, res) => {
  const { priceId } = req.params;
  const { addedBy } = req.query;

  try {
    // Validate the priceId
    if (!Types.ObjectId.isValid(priceId)) {
      return res.status(400).json({ error: 'Invalid price ID' });
    }

    // Find and delete the price entry by its _id and the addedBy user
    const priceEntry = await Price.findOneAndDelete({
      _id: new Types.ObjectId(priceId),
      addedBy: new Types.ObjectId(addedBy)
    });

    if (!priceEntry) {
      return res.status(404).json({ error: 'Price entry not found or not authorized to delete' });
    }

    // Check if there are any other prices associated with the same store
    const otherPricesForStore = await Price.findOne({
      store: priceEntry.store,
      product: priceEntry.product,
      _id: { $ne: priceEntry._id }  // Exclude the current price entry
    });

    // If no other prices are associated with this store, delete the store entry
    if (!otherPricesForStore) {
      const storeDeleted = await Store.findOneAndDelete({ _id: priceEntry.store });

      // Optionally, you can also check if the store was successfully deleted
      if (!storeDeleted) {
        return res.status(500).json({ error: 'Failed to delete associated store' });
      }
    }

    res.json({ message: 'Price entry and associated store (if orphaned) successfully deleted' });
  } catch (err) {
    console.error('Error deleting price entry:', err);
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
        
        // Format prices before returning them
        const formattedPrices = prices.map((price) => ({
          ...price._doc, // Use _doc to get raw document data in Mongoose
          price: parseFloat(price.price.toString()).toFixed(2), // Convert Decimal128 to number and round to 2 decimal places
        }));

        res.json(formattedPrices);
    } catch (error) {
        console.error('Грешка при намиране на ценовата история:', error);
        res.status(500).json({ message: 'Възникна грешка при намиране на ценовата история' });
    }
});


// Helper function to check if an ID is a valid ObjectId
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id) && new mongoose.Types.ObjectId(id).toString() === id;
};


app.post('/api/shopping/cheapest-store', async (req, res) => {
  const shoppingList = req.body; // [{ productId, quantity }, { productId, quantity }, ...]

  try {
    // Step 1: Fetch all stores
    const stores = await Store.find(); // Assuming you have a Store model

    let cheapestStore = null;
    let lowestTotalPrice = Number.MAX_VALUE;

    // Step 2: Iterate over each store and check if it has all products from the shopping list
    for (const store of stores) {
      let totalPrice = 0;
      let storeHasAllProducts = true;

      // Step 3: Iterate through the shopping list
      for (const item of shoppingList) {
        const price = await Price.findOne({ store: store._id, product: item.productId });

        if (!price) {
          // If the product is not available in the store, skip this store
          storeHasAllProducts = false;
          break;
        }

        // Calculate total price for this product in the store
        totalPrice += parseFloat(price.price) * item.quantity;
      }

      // If the store has all products, check if it's the cheapest one
      if (storeHasAllProducts && totalPrice < lowestTotalPrice) {
        lowestTotalPrice = totalPrice;
        cheapestStore = store;
      }
    }

    // Step 4: Return the cheapest store or an error message if none found
    if (cheapestStore) {
      res.json({
        store: cheapestStore,
        totalPrice: lowestTotalPrice,
      });
    } else {
      res.status(404).json({ message: 'No store has all the products from the shopping list.' });
    }

  } catch (error) {
    console.error('Error finding the cheapest store:', error);
    res.status(500).json({ message: 'An error occurred while processing your request.' });
  }
});



app.post('/api/cheapest-store', async (req, res) => {
  const shoppingList = req.body; // [{ productId, quantity }, { productId, quantity }, ...]

  try {
    // Step 1: Fetch all stores
    const stores = await Store.find(); // Assuming you have a Store model

    const storePrices = [];

    // Step 2: Iterate over each store and check if it has all products from the shopping list
    for (const store of stores) {
      let totalPrice = 0;
      let storeHasAllProducts = true;

      // Step 3: Iterate through the shopping list
      for (const item of shoppingList) {
        const price = await Price.findOne({ store: store._id, product: item.productId });

        if (!price) {
          // If the product is not available in the store, skip this store
          storeHasAllProducts = false;
          break;
        }

        // Calculate total price for this product in the store
        totalPrice += parseFloat(price.price) * item.quantity;
      }

      // If the store has all products, push the store and total price to storePrices array
      if (storeHasAllProducts) {
        storePrices.push({
          store,
          totalPrice
        });
      }
    }

    // Step 4: Sort the stores by total price in ascending order
    storePrices.sort((a, b) => a.totalPrice - b.totalPrice);
    res.json(storePrices);

  } catch (error) {
    console.error('Error finding the cheapest stores:', error);
    res.status(500).json({ message: 'An error occurred while processing your request.' });
  }
});




app.post('/api/cheapest-store2', async (req, res) => {
  const productList = req.body;  // Assuming productList is an array of product IDs like [productId1, productId2, ...]

  try {
      // Validate product IDs and filter out invalid ones
      const validProductIds = productList
          .filter(product =>  new mongoose.Types.ObjectId(product.productId))  // Ensure only valid ObjectId strings are included
          .map(product => new mongoose.Types.ObjectId(product.productId));

      if (validProductIds.length === 0) {
          return res.status(400).json({ message: 'Invalid product IDs' });
      }

      // Fetch the latest price for each product in each store
      const latestPrices = await Price.aggregate([
          {
              $match: {
                  product: { $in: validProductIds }
              }
          },
          {
              $sort: { date: -1 }  // Sort by the latest date
          },
          {
              $group: {
                  _id: { store: '$store', product: '$product' },
                  latestPrice: { $first: '$$ROOT' }  // Get the most recent price
              }
          }
      ]);

      if (!latestPrices.length) {
          return res.status(404).json({ message: 'No prices found for the requested products' });
      }

      // Group the prices by store and calculate the total price for each store
      const storePriceMap = latestPrices.reduce((acc, price) => {
          const storeId = price._id.store.toString();
          if (!acc[storeId]) {
              acc[storeId] = { storeId, totalPrice: 0, products: [] };
          }
          acc[storeId].totalPrice += parseFloat(price.latestPrice.price.toString());
          acc[storeId].products.push({
              productId: price._id.product,
              price: parseFloat(price.latestPrice.price.toString())
          });
          return acc;
      }, {});

      // Convert the storePriceMap into an array for easier processing
      const storePrices = Object.values(storePriceMap);

      // Sort the stores by the total price to get the cheapest ones
      storePrices.sort((a, b) => a.totalPrice - b.totalPrice);

      // Fetch store details for each store in the sorted list
      const storesWithDetails = await Promise.all(
          storePrices.map(async (storeData) => {
              const store = await Store.findById(storeData.storeId).exec();
              return {
                  storeId: store._id,
                  name: store.name,
                  location: store.location,
                  totalPrice: storeData.totalPrice.toFixed(2),  // Format total price to 2 decimal places
                  products: storeData.products  // Return product-wise prices
              };
          })
      );

      // Return the list of stores sorted by total price
      res.json(storesWithDetails);
  } catch (error) {
      console.error('Error fetching the cheapest stores:', error);
      res.status(500).json({ error: 'An error occurred while fetching the cheapest stores' });
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

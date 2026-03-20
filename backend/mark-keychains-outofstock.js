require('dotenv').config();
const { connectToDatabase, COLLECTIONS } = require('./config/database');

async function markKeychainsOutOfStock() {
    try {
        const { db, client } = await connectToDatabase();
        if (!db) {
            console.error("Failed to connect to DB");
            process.exit(1);
        }

        const productsCollection = db.collection(COLLECTIONS.PRODUCTS);

        const filter = { category: /keychain/i };
        const count = await productsCollection.countDocuments(filter);
        console.log(`Found ${count} keychain products.`);

        if (count > 0) {
            const result = await productsCollection.updateMany(
                filter,
                {
                    $set: {
                        in_stock: false,
                        stock_quantity: 0
                    }
                }
            );
            console.log(`Successfully updated ${result.modifiedCount} products to be out of stock.`);
        }

        await client.close();
        console.log("Database connection closed.");
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

markKeychainsOutOfStock();

const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const mongooseGridfs = require("mongoose-gridfs");

if (!dotenv.config({ path: "../.env" })) {
  console.error("Unable to load env vars!");
  process.exit(1);
}

// Call main func (no top level async)
Main();

// Everything should be in Main
async function Main() {
  try {
    const mongoUri = `${process.env.MONGO_CONNECTION_STRING}/gfs`;
    const database = await mongoose.connect(mongoUri);

    const fooBucket = mongooseGridfs.createModel({
      bucketName: "foo",
      connection: database.connection,
    });

    const filePath = path.resolve(__dirname, "../test.txt");
    const readStream = fs.createReadStream(filePath);
    const fileMetadata = { someprop: "someval" };
    const fileOptions = { filename: "test.txt", contentType: "text/plain", metadata: fileMetadata };

    // fooBucket.write(fileOptions, readStream, (error, result) => {
    //   if (error) {
    //     throw error;
    //   }
    //   console.log(`Success!\n`, result);
    //   database.disconnect();
    // });

    const fooBucketFiles = await database.connection.collection('foo.files').find({}).toArray();
    console.log(fooBucketFiles);
    
    // Cleanup
    if (database.connection) {
      database.disconnect();
    }
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

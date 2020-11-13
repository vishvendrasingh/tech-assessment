const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const { MongoClient, ObjectId } = require('mongodb');
const bodyParser = require('body-parser'); 
const { pick, } = require('lodash');
// app.use(bodyParser.urlencoded({
//     extended: true
// }));
app.use(bodyParser.json());

/** * As recommendation https://docs.atlas.mongodb.com/best-practices-connecting-to-aws-lambda/ */
let cachedDb;
const connectToDatabase = async () => {
  try {
    if (cachedDb) {
      return Promise.resolve(cachedDb); // rollbar.log('=> using cached database instance');
    }
    cachedDb = await MongoClient.connect('mongodb://127.0.0.1:27017',
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
    );
    return cachedDb;
  } catch (e) {
    throw e;
  }
};

const getDbo = async () => {
  const db = await connectToDatabase();
  const dbo = db.db(`ecommerce`);
  return dbo;
}

app.get('/customerId', async (req, res) => {
  try{
    const dbo = await getDbo();
    const result = await dbo.collection('customers').findOne()
    result && result._id ?res.send({customerId:result._id}) : res.send('Some error occurred!');
  }catch(e){
    console.log(e)
    res.send('Error')
  }
});

app.post('/order/create/:customerId', async (req, res) => {
  try{
      const {customerId} = req.params
      const {productTitle,productPrice,productDescription} = req.body
      const dbo = await getDbo();

      const result = await dbo.collection('orders').insertOne({
          customerId:ObjectId(customerId),
          productTitle,
          productPrice,
          productDescription,
          'status':'success',
          createdAt: new Date(),
          updatedAt: new Date(),
      });
      result && result.insertedCount>0 ?res.send({orderId:result.insertedId}) : res.send('Some error occurred!');
  }catch(e){
    console.log(e)
    res.send('Error')
  }
});

app.get('/order/list/:customerId', async (req, res) => {
  try{
    const {customerId} = req.params
    const dbo = await getDbo();

    const result = await dbo.collection('orders').find({ customerId: ObjectId(customerId) }).toArray()
    res.send(result);
  }catch(e){
    console.log(e)
    res.send('Error')
  }
});

app.put('/order/update/:orderId', async (req, res) => {
  try{
    const {orderId} = req.params
    const modifier = pick(req.body, ['productTitle','productPrice','productDescription']);
    console.log(modifier)
    const dbo = await getDbo();
    const result = await dbo.collection('orders').updateOne({
      _id:ObjectId(orderId)
    }, { $set: {
      ...modifier,
      updatedAt: new Date(),
    }
    });

    result && result.modifiedCount>0 ?res.send('success') : res.send('Some error occurred!');
  }catch(e){
    console.log(e)
    res.send('Error')
  }
});

app.get('/order/cancel/:orderId', async (req, res) => {
  try{
    const {orderId} = req.params
    const dbo = await getDbo();
    const result = await dbo.collection('orders').updateOne({
      _id:ObjectId(orderId)
    }, { $set:{ 
      status: 'cancelled',
      updatedAt: new Date(),
    }
    });

    result && result.modifiedCount>0 ?res.send('success') : res.send('Some error occurred!');
  }catch(e){
    console.log(e)
    res.send('Error')
  }
});

app.get('/order/delete/:orderId', async (req, res) => {
  try{
    const {orderId} = req.params
    const dbo = await getDbo();
    const result = await dbo.collection('orders').deleteOne({
      _id:ObjectId(orderId)
    });

    result && result.deletedCount>0 ?res.send('success') : res.send('Some error occurred!');
  }catch(e){
    console.log(e)
    res.send('Error')
  }
});



app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

module.exports = app;
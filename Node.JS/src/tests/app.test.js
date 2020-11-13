const request = require('supertest');
const app = require('../app');

// test('Should return 200 status', async () => {
//     const response = await request(app).get('/health');
//     expect(response.statusCode).toBe(200);
// });
let customerId; //= '5fae04027327e24208c839f2'
let orderId

test('Get a Customer', async () => {
    const response = await request(app).get(`/customerId`)
    .expect('Content-Type', /json/)
    .expect(200);
    customerId = response.body.customerId
})

test('Create order for a customer', async () => {
    const response = await request(app).post(`/order/create/${customerId}`)
    .send({
        "productTitle":"Sony ZX Series Stereo Headphones",
        "productPrice":"12.30",
        "productDescription":"Maximizing your personal audio experience has never been easier than with SONY ZX-Series Monitor headphones. Built with comfort and performance in mind, there's no need to compromise. "
        })
    .expect('Content-Type', /json/)
    .expect(200);
    orderId = response.body.orderId
})

test('List order Api test', async () => {
    const response = await request(app).get(`/order/list/${customerId}`)
    .expect('Content-Type', /json/)
    .expect(200)
    expect(response.body[0]).toHaveProperty("_id");
    /** OR */
    // expect(response.headers['content-type']).toBe('application/json; charset=utf-8')
    // expect(response.status).toBe(200)
})

test('Update order for a customer', async () => {
    const response = await request(app).put(`/order/update/${orderId}`)
    .send({
    "productDescription":"Update in description"
    })
    .expect('Content-Type', /text/)
    .expect(200)
    .expect('success');
})

test('Cancel order for a customer which updates order status to cancelled', async () => {
    const response = await request(app).get(`/order/cancel/${orderId}`)
    .expect('Content-Type', /text/)
    .expect(200)
    .expect('success');
})

test('Delete order for a customer', async () => {
    const response = await request(app).get(`/order/delete/${orderId}`)
    .expect('Content-Type', /text/)
    .expect(200)
    .expect('success');
})
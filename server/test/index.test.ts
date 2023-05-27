import request from "supertest";
import chai  from  "chai";
import app  from  "../index";
const expect = chai.expect;
describe('Express Routes', () => {

    let server;
    before((done) => {
        // Perform any necessary setup tasks here
        // For example, establish database connections, initialize dependencies, etc.
    
        // Start the server
        server = app.listen(3000, () => {
          console.log('Server started');
          done();
        });
      });

  describe('GET /', () => {
    it('should respond with status 200 and serve the login page', (done) => {
    //   request(app)
    //     .get('/')
    //     .expect(200)
    //     .expect('Content-Type', 'text/html')
    //     .end((err, res) => {
    //       if (err) return done(err);
    //       expect(res.text).to.include('<html>');
    //       done();
    //     });
    request(app).get("/").then(res=>{
        expect(res.statusCode).to.equal(200);
        done();
    });
    });
  });

//   describe('GET /chat-page', () => {
//     it('should respond with status 200 and serve the chat page', (done) => {
//       request(app)
//         .get('/chat-page')
//         .expect(200)
//         .expect('Content-Type', 'text/html')
//         .end((err, res) => {
//           if (err) return done(err);
//           expect(res.text).to.include('<html>');
//           done();
//         });
//     });
//   });

//   describe('POST /login', () => {
//     it('should respond with status 200 and return success when user is not taken', (done) => {
//       request(app)
//         .post('/login')
//         .send({ name: 'test', uuid: '12345' })
//         .expect(200)
//         .expect('Content-Type', 'application/json; charset=utf-8')
//         .end((err, res) => {
//           if (err) return done(err);
//           expect(res.body.status).to.equal('200');
//           expect(res.body.success).to.be.true;
//           done();
//         });
//     });
//   });

//   describe('POST /message', () => {
//     it('should respond with status 200 and return messages', (done) => {
//       request(app)
//         .post('/message')
//         .send({ user1: 'user1', user2: 'user2' })
//         .expect(200)
//         .expect('Content-Type', 'application/json; charset=utf-8')
//         .end((err, res) => {
//           if (err) return done(err);
//           expect(res.body.payload).to.be.an('array');
//           done();
//         });
//     });
//   });

//   describe('POST /saveofflinemessage', () => {
//     it('should respond with status 200', (done) => {
//       request(app)
//         .post('/saveofflinemessage')
//         .send([{ from: { username: 'user1' }, to: { username: 'user2' }, text: 'Hello' }])
//         .expect(200)
//         .expect('Content-Type', 'text/html; charset=utf-8')
//         .end((err, res) => {
//           if (err) return done(err);
//           // Add any necessary assertions here
//           done();
//         });
//     });
//   });
});
import request from "supertest";
import chai  from  "chai";
import app from '../index';

const expect = chai.expect;

describe('Express Routes', () => {
    let server: any;
    before((done) => {
      server = app.listen(3001, () => {
        console.log('Server started');
        done();
      });
    });

    after((done) => {
      server.close(() => {
        console.log('Server closed');
        done();
      });
    });

    describe('GET /', () => {
      it('should respond with status 200 and serve the login page', async () => {
        const response = await request(server)
          .get('/')
          .expect(200)

        expect(response.text).to.include('<html>');
      });
    });

  });

  describe('POST /login', () => {
    it('should respond with status 200 and return success when user is not taken', (done) => {
      request(app)
        .post('/login')
        .send({ name: 'test', uuid: '12345' })
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body.status).to.equal('200');
          expect(res.body.success).to.be.false;
          done();
        });
    });
  });

  describe('POST /message', () => {
    it('should respond with status 200 and return messages', (done) => {
      request(app)
        .post('/message')
        .send({ user1: 'user1', user2: 'user2' })
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body.payload).to.be.an('array');
          console.log("🚀 ~ file: index.test.ts:98 ~ .end ~ res.body.payload:", res.body.payload)
          done();
        });
    });
  });
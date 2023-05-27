"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const chai_1 = __importDefault(require("chai"));
const index_1 = __importDefault(require("../index"));
const expect = chai_1.default.expect;
describe('Express Routes', () => {
    let server;
    before((done) => {
        server = index_1.default.listen(3001, () => {
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
        it('should respond with status 200 and serve the login page', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(server)
                .get('/')
                .expect(200);
            expect(response.text).to.include('<html>');
        }));
    });
});
describe('POST /login', () => {
    it('should respond with status 200 and return success when user is not taken', (done) => {
        (0, supertest_1.default)(index_1.default)
            .post('/login')
            .send({ name: 'test', uuid: '12345' })
            .expect(200)
            .end((err, res) => {
            if (err)
                return done(err);
            expect(res.body.status).to.equal('200');
            expect(res.body.success).to.be.false;
            done();
        });
    });
});
describe('POST /message', () => {
    it('should respond with status 200 and return messages', (done) => {
        (0, supertest_1.default)(index_1.default)
            .post('/message')
            .send({ user1: 'user1', user2: 'user2' })
            .expect(200)
            .end((err, res) => {
            if (err)
                return done(err);
            expect(res.body.payload).to.be.an('array');
            console.log("🚀 ~ file: index.test.ts:98 ~ .end ~ res.body.payload:", res.body.payload);
            done();
        });
    });
});

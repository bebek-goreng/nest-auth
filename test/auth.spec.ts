import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../src/auth/schema/user.schema';
import { Model } from 'mongoose';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let userModel: Model<User>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    userModel = moduleFixture.get<Model<User>>('UserModel');
  });

  describe('POST /api/auth/signup', () => {

    it('should reject signup user with invalid email and invalid password length', async () => {
      const responseTest = await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send({
          name: 'test',
          email: 'test',
          password: 'test'
        })

      expect(responseTest.status).toBe(400);
      expect(responseTest.body.message).toEqual(
        expect.arrayContaining(['Please enter correct email'])
      );
      expect(responseTest.body.error).toBe('Bad Request');
    });
  });

  it('should create new user and return jwt token', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/signup')
      .send({
        name: 'test',
        email: 'test@mail.com',
        password: 'password'
      })

    expect(response.body.token).toBeDefined();
  });

  afterAll(async () => {
    await userModel.deleteMany({
      name: 'test'
    });

    await app.close();
  });
});

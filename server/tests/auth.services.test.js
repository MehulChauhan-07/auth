import { expect } from "chai";
import sinon from "sinon";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import {
  generateToken,
  verifyToken,
  hashPassword,
  comparePasswords,
} from "../services/auth.services.js";

describe("Auth Services Tests", () => {
  describe("generateToken", () => {
    it("should return a valid JWT token", () => {
      // Arrange
      const userId = "60d0fe4f5311236168a109ca";
      const mockToken = "mock.jwt.token";
      const jwtSignStub = sinon.stub(jwt, "sign").returns(mockToken);

      // Act
      const token = generateToken(userId);

      // Assert
      expect(token).to.equal(mockToken);
      expect(jwtSignStub.calledOnce).to.be.true;

      // Cleanup
      jwtSignStub.restore();
    });
  });

  describe("verifyToken", () => {
    it("should verify and return decoded token payload", () => {
      // Arrange
      const mockToken = "valid.jwt.token";
      const mockPayload = { id: "60d0fe4f5311236168a109ca" };
      const jwtVerifyStub = sinon.stub(jwt, "verify").returns(mockPayload);

      // Act
      const result = verifyToken(mockToken);

      // Assert
      expect(result).to.deep.equal(mockPayload);
      expect(jwtVerifyStub.calledOnce).to.be.true;

      // Cleanup
      jwtVerifyStub.restore();
    });

    it("should throw an error for invalid token", () => {
      // Arrange
      const mockToken = "invalid.jwt.token";
      const jwtVerifyStub = sinon
        .stub(jwt, "verify")
        .throws(new Error("Invalid token"));

      // Act & Assert
      expect(() => verifyToken(mockToken)).to.throw();

      // Cleanup
      jwtVerifyStub.restore();
    });
  });

  // Add more tests for other functions
});

// Frontend test suite

import { describe, expect, it } from "vitest";

import {
    validateConfirmPassword,
    validateEmail,
    validateFullName,
    validateLoginForm,
    validatePassword,
    validateRegisterForm,
    validateReviewForm,
} from "../src/lib/validation";

describe("email", () => {
    it("accepts a normal address", () => {
        expect(validateEmail("aline@alustudent.com")).toBeNull();
    });

    it("rejects an empty one", () => {
        expect(validateEmail("")).toBe("Email is required");
    }); 

    it ("rejects text that is not an address", () => {
        expect(validateEmail("not-an-email")).toBe("Enter a valid email address");
    });
}   );

describe("password", () => {
    it("accepts 8 characters or more", () => {
        expect(validatePassword("Password123")).toBeNull();
    });

    it("rejects an empty one", () => {
        expect(validatePassword("")).toBe("Password is required");
    });

    it("rejects fewer than 8 characters", () => {
        expect(validatePassword("short")).toBe("Password must be at least 8 characters");
    });
}   );      

describe("full name", () => {
    it("accepts a real name", () => {
        expect(validateFullName("Aline Teta")).toBeNull();
    });

    it("rejects blank spaces", () => {
        expect(validateFullName("   ")).toBe("Full name is required");
    });
}   );    

describe("confirm password", () => {
    it("accepts a match", () => {
        expect(validateConfirmPassword("Password123", "Password123")).toBeNull();
    });
      

    it("rejects a mismatch", () => {
        expect(validateConfirmPassword("Password123", "Password124")).toBe("Passwords do not match");
    });
});

describe ("register form", () => {
    it ("passes a complete form", () => {
        const errors = validateRegisterForm({
            fullName: "Aline Teta",
            email: "aline@alustudent.com",
            password: "Password123",
            confirmPassword: "Password123"
        });
        expect(errors).toEqual({});
    });
    
    it("collects one error per broken field", () => {
        const errors = validateRegisterForm({
            fullName: "",
            email: "nope",
            password: "short",
            confirmPassword: "different"
        });
        expect(Object.keys(errors).sort()).toEqual([
            "confirmPassword",
            "email",
            "fullName",
            "password",
            ]);
  });
});

describe("login form", () => {
  it("passes with valid credentials", () => {
    expect(
      validateLoginForm({ email: "aline@alustudent.com", password: "Password123" })
    ).toEqual({});
  });

  it("flags both fields when empty", () => {
    const errors = validateLoginForm({ email: "", password: "" });
    expect(errors.email).toBeDefined();
    expect(errors.password).toBeDefined();
  });
});

describe("review form (sprint 3)", () => {
  it("passes when all four categories are rated", () => {
    const errors = validateReviewForm({
      mentorship: 5,
      tasks: 4,
      learning: 4,
      environment: 3,
    });
    expect(errors).toEqual({});
  });

  it("flags every category still at 0 (not chosen yet)", () => {
    const errors = validateReviewForm({
      mentorship: 0,
      tasks: 5,
      learning: 0,
      environment: 2,
    });
    expect(Object.keys(errors).sort()).toEqual(["learning", "mentorship"]);
  });

  it("rejects ratings outside 1 to 5", () => {
    const errors = validateReviewForm({
      mentorship: 6,
      tasks: 1,
      learning: 1,
      environment: 1,
    });
    expect(errors.mentorship).toBe("Pick a rating from 1 to 5 stars");
  });
});

            
       

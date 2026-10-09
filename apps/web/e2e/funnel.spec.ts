import { expect, test, type Page } from "@playwright/test";

const password = "password123";
const uniqueEmail = () => `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;

async function takeQuiz(page: Page, gender: "Male" | "Female", answer: string) {
  await page.goto("/");
  await page.getByRole("button", { name: gender, exact: true }).click();
  for (let i = 1; i <= 5; i++) {
    await expect(page.getByText(`${i}/5`)).toBeVisible();
    await page.getByRole("button", { name: answer, exact: true }).click();
  }
}

test("anonymous quiz -> sign up -> report -> sign out -> sign in", async ({ page }) => {
  const email = uniqueEmail();

  await takeQuiz(page, "Female", "Strongly agree");
  await expect(page).toHaveURL(/\/sign-up$/);

  await page.getByPlaceholder("Enter your email").fill(email);
  await page.getByPlaceholder("Create Password").fill(password);
  await page.getByRole("button", { name: "Get My Results" }).click();

  await expect(page).toHaveURL(/\/report$/);
  await expect(page.getByRole("main").getByText("High ADHD Traits", { exact: true })).toBeVisible();
  await expect(page.getByText(/In women, ADHD/)).toBeVisible();

  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/sign-in$/);

  await page.goto("/report");
  await expect(page).toHaveURL(/\/sign-in$/);

  await page.getByPlaceholder("Email").fill(email);
  await page.getByPlaceholder("Password").fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByRole("main").getByText("High ADHD Traits", { exact: true })).toBeVisible();
});

test("a signed-in user retakes the quiz and sees the updated report", async ({ page }) => {
  await takeQuiz(page, "Male", "Strongly agree");
  await page.getByPlaceholder("Enter your email").fill(uniqueEmail());
  await page.getByPlaceholder("Create Password").fill(password);
  await page.getByRole("button", { name: "Get My Results" }).click();
  await expect(page.getByRole("main").getByText("High ADHD Traits", { exact: true })).toBeVisible();

  await page.getByRole("link", { name: "Retake test" }).click();
  await takeQuiz(page, "Male", "Strongly Disagree");

  await expect(page).toHaveURL(/\/report$/);
  await expect(page.getByRole("main").getByText("Low ADHD Traits", { exact: true })).toBeVisible();
  await expect(page.getByText(/In men, ADHD traits may more often/)).toBeVisible();
});

test("quiz progress survives a reload", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Male", exact: true }).click();
  await page.getByRole("button", { name: "Agree", exact: true }).click();
  await expect(page.getByText("2/5")).toBeVisible();

  await page.reload();
  await expect(page.getByText("2/5")).toBeVisible();
  await page.getByRole("button", { name: "Previous question" }).click();
  await expect(page.getByRole("button", { name: "Agree", exact: true })).toHaveAttribute("aria-pressed", "true");
});

test("sign up validates input and reports taken emails", async ({ page }) => {
  const email = uniqueEmail();
  await page.goto("/sign-up");
  await page.getByRole("button", { name: "Get My Results" }).click();
  await expect(page.getByText("Enter a valid email")).toBeVisible();

  await page.getByPlaceholder("Enter your email").fill(email);
  await page.getByPlaceholder("Create Password").fill(password);
  await page.getByRole("button", { name: "Get My Results" }).click();
  await expect(page.getByRole("heading", { name: "No report yet" })).toBeVisible();
  await page.getByRole("button", { name: "Sign out" }).click();

  await page.goto("/sign-up");
  await page.getByPlaceholder("Enter your email").fill(email);
  await page.getByPlaceholder("Create Password").fill(password);
  await page.getByRole("button", { name: "Get My Results" }).click();
  await expect(page.getByText("An account with this email already exists")).toBeVisible();
  await expect(page.getByRole("link", { name: "Sign in instead" })).toBeVisible();
});

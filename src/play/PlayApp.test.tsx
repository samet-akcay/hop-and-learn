import { cleanup, fireEvent, render, screen } from "@testing-library/preact";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PlayApp } from "./PlayApp";
import { freshPlayData } from "./settings";

afterEach(() => { cleanup(); vi.useRealTimers(); });

function quietData() {
  const data = freshPlayData();
  data.settings.speech = false;
  data.settings.sound = false;
  return data;
}

async function openNumberLine() {
  const user = userEvent.setup();
  render(<PlayApp initialData={quietData()} />);
  await user.click(screen.getByRole("button", { name: "Number Line", exact: true }));
  return user;
}

async function hopToTheEnd(user: ReturnType<typeof userEvent.setup>) {
  while (screen.queryByRole("button", { name: /^HOP/ })) await user.click(screen.getByRole("button", { name: /^HOP/ }));
}

describe("Hop & Learn", () => {
  it("shows the three main games pinned at the top and the other games below", () => {
    render(<PlayApp initialData={quietData()} />);
    const cards = [...document.querySelectorAll(".my-games .game-card b")].map(item => item.textContent);
    expect(cards).toEqual(["Number Line", "Number Bonds", "Times Tables"]);
    expect(screen.getByRole("button", { name: "Money", exact: true })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Sentence Builder", exact: true })).toBeTruthy();
  });

  it("shows three big answers straight away, so he can answer without hopping", async () => {
    const user = await openNumberLine();
    expect(document.querySelector(".numberline-svg")).toBeTruthy();
    expect(document.querySelectorAll(".big-choice")).toHaveLength(3);
    const [start, op, amount] = document.querySelector(".play-question h1")!.textContent!.split(" ");
    const answer = String(op === "+" ? Number(start) + Number(amount) : Number(start) - Number(amount));
    await user.click(screen.getByRole("button", { name: answer }));
    expect(screen.getByRole("heading", { name: "We did it!" })).toBeTruthy();
  });

  it("lets him hop to work it out, then gives a star for the right one", async () => {
    const user = await openNumberLine();
    await hopToTheEnd(user);
    const answers = [...document.querySelectorAll<HTMLButtonElement>(".big-choice")];
    expect(answers).toHaveLength(3);
    const answer = /We landed on (\d+)/.exec(document.querySelector(".work-control p")?.textContent ?? "")?.[1];
    await user.click(screen.getByRole("button", { name: answer }));
    expect(screen.getByRole("heading", { name: "We did it!" })).toBeTruthy();
    expect(document.querySelector(".star-pill")?.textContent).toContain("1");
  });

  it("keeps a wrong answer calm: the button greys out and he can try again", async () => {
    const user = await openNumberLine();
    await hopToTheEnd(user);
    const answer = /We landed on (\d+)/.exec(document.querySelector(".work-control p")?.textContent ?? "")?.[1];
    const wrong = [...document.querySelectorAll<HTMLButtonElement>(".big-choice")].find(button => button.textContent !== answer)!;
    await user.click(wrong);
    expect(screen.getByText("Uh oh. That's okay. Let's fix it.")).toBeTruthy();
    expect(wrong.disabled).toBe(true);
    await user.click(screen.getByRole("button", { name: answer }));
    expect(screen.getByRole("heading", { name: "We fixed it!" })).toBeTruthy();
  });

  it("pins a game into My games and unpins it again", async () => {
    const user = userEvent.setup();
    render(<PlayApp initialData={quietData()} />);
    await user.click(screen.getByRole("button", { name: "Pin Money" }));
    expect([...document.querySelectorAll(".my-games .game-card b")].map(item => item.textContent)).toContain("Money");
    await user.click(screen.getByRole("button", { name: "Unpin Number Line" }));
    expect([...document.querySelectorAll(".my-games .game-card b")].map(item => item.textContent)).not.toContain("Number Line");
    expect(screen.getByRole("button", { name: "Pin Number Line" })).toBeTruthy();
  });

  it("goes back to the menu with the home button", async () => {
    const user = await openNumberLine();
    await user.click(screen.getByRole("button", { name: "Back to games" }));
    expect(screen.getByRole("heading", { name: "Hop & Learn" })).toBeTruthy();
  });

  it("opens the grown-up corner only after a two-second hold, and hides games from the menu", async () => {
    vi.useFakeTimers();
    render(<PlayApp initialData={quietData()} />);
    const gear = screen.getByRole("button", { name: /Grown-ups/ });
    fireEvent.pointerDown(gear);
    vi.advanceTimersByTime(1000);
    fireEvent.pointerUp(gear);
    expect(screen.queryByRole("dialog")).toBeNull();
    fireEvent.pointerDown(gear);
    vi.advanceTimersByTime(2000);
    expect(await screen.findByRole("dialog", { name: "Grown-up corner" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "✓ Money" }));
    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    expect(screen.queryByRole("button", { name: "Money", exact: true })).toBeNull();
    expect(screen.queryByText("Money")).toBeNull();
  });
});

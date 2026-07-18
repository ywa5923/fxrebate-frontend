"use client";

import { useState, type SubmitEvent } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

const ASSETS = {
  bg: "/figma-login/bg.svg",
  logo: "/figma-login/logo.svg",
  user: "/figma-login/user.svg",
  lock: "/figma-login/lock.svg",
} as const;

const fieldGroupClassName =
  "h-[45px] rounded border-white bg-transparent shadow-none has-[[data-slot=input-group-control]:focus-visible]:ring-white/40";

const fieldInputClassName =
  "h-full text-sm font-light uppercase tracking-wide text-white placeholder:text-white/90 md:text-sm";

export default function FigmaLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#2148c0]">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={ASSETS.bg}
          alt=""
          className="h-full w-full object-cover"
        />
      </div>

      <form
        onSubmit={onSubmit}
        className="relative z-10 flex w-full max-w-[300px] flex-col items-center px-4"
      >
        <div className="mb-16 w-[120px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ASSETS.logo}
            alt="Logo"
            width={120}
            height={98}
            className="h-auto w-full"
          />
        </div>

        <div className="mb-5 w-full">
          <Label htmlFor="figma-login-username" className="sr-only">
            Username
          </Label>
          <InputGroup className={fieldGroupClassName}>
            <InputGroupAddon align="inline-start" className="pl-3 text-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ASSETS.user}
                alt=""
                width={20}
                height={20}
                className="size-5"
              />
            </InputGroupAddon>
            <InputGroupInput
              id="figma-login-username"
              type="text"
              name="username"
              autoComplete="username"
              placeholder="USERNAME"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={fieldInputClassName}
            />
          </InputGroup>
        </div>

        <div className="mb-10 w-full">
          <Label htmlFor="figma-login-password" className="sr-only">
            Password
          </Label>
          <InputGroup className={fieldGroupClassName}>
            <InputGroupAddon align="inline-start" className="pl-3 text-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ASSETS.lock}
                alt=""
                width={20}
                height={20}
                className="size-5"
              />
            </InputGroupAddon>
            <InputGroupInput
              id="figma-login-password"
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="PASSWORD"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={fieldInputClassName}
            />
          </InputGroup>
        </div>

        <Button
          type="submit"
          className="mb-4 h-[45px] w-full rounded bg-white text-base font-semibold uppercase tracking-wide text-[#2148c0] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.3)] hover:bg-white/95 hover:text-[#2148c0]"
        >
          login
        </Button>

        <Button
          type="button"
          variant="link"
          className="h-auto p-0 text-base font-medium text-white hover:text-white"
          onClick={(e) => e.preventDefault()}
        >
          Forgot password?
        </Button>
      </form>
    </div>
  );
}

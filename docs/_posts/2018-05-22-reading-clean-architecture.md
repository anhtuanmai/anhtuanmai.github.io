---
title: "Clean Architecture: a direction, not a rewrite"
date: 2018-05-22
author: Anh Tuan Mai
published: true
categories:
  - engineering
tags:
  - architecture
  - clean-architecture
  - refactoring
  - reading
excerpt: "Uncle Bob's Clean Architecture isn't a weekend rewrite — it's a direction you can start walking today, even on a project that's already in flight."
---

If you only read one architecture article this year, make it [Uncle Bob's *The Clean
Architecture*](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html).
I just finished it and I haven't been this excited about a blog post in a long time —
excited enough to write this one, because I think every team should at least know what
it asks of us.

## The idea, in one sentence

**Business rules in the center, frameworks on the outside, dependencies always
pointing inward.** The database, the UI, the network, the web framework — all of them
are *details*, plugged in from the edges. The core of the app shouldn't know they
exist.

That one rule does a surprising amount of work:

- You can **swap the database** without touching the rules.
- You can **test the rules** without booting the framework, the device, or the network.
- You can **change the UI** — or run two of them — without rewriting the logic behind it.
- The shape of the code starts to look like the shape of the **business**, not the
  shape of your tools.

Read like that, half of the bugs we keep fighting stop looking like bugs and start
looking like the consequence of letting frameworks reach into the core. We're paying a
tax we never agreed to.

## So why isn't this everywhere already?

Because it sounds, at first, like a rewrite. And rewrites are scary, expensive, and
usually a bad idea on a project that's already shipping.

Here's the part I want to promote: **Clean Architecture is not a rewrite. It's a
direction.** You don't need a green field. You don't need a six-month freeze. You need
to know which way is "in" and start pointing your new arrows that way.

## Why I'm writing this down

I'm writing this because I want the team to read the original article. Not my summary
— the source. Half an hour of reading, and the way you look at our code afterward is
different.

A big rewrite is not always the answer. **A direction is.** Uncle Bob gave us one.
Let's start walking.
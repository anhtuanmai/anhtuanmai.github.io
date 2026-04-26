---
title: "Building a custom Android keyboard at Exyzt"
date: 2016-09-18
author: Anh Tuan Mai
published: true
categories:
  - engineering
tags:
  - android
  - keyboard
  - exyzt
  - mobile
  - aosp
excerpt: "Customized keyboard on Android AOSP."
---

At **Exyzt**, I've been working on something a bit unusual: our own
**Android keyboard**, shipped with the company's pro app.

## Why we needed one

Our field devices run **plain AOSP** — no Google services, no Play Store, just the
stock open-source build. That means the only keyboard out of the box is the basic
**AOSP LatinIME**. It's fine for casual texting; it's not fine for our work.

## What we built

A small keyboard app that fits the work. Agents type so much faster now.

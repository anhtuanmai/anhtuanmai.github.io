---
title: "From MVP to MVI on Android — borrowing from Redux"
date: 2019-12-15
author: Anh Tuan Mai
published: true
categories:
  - engineering
tags:
  - android
  - kotlin
  - mvi
  - mvp
  - redux
  - architecture
excerpt: "How we replaced our MVP screens with an MVI architecture inspired by Redux — one state, one stream, fewer surprises."
---

For most of the year, the team has been quietly migrating our Android app from **MVP**
to **MVI**. The new pieces are inspired by **Redux** on the web side, adapted to fit
Kotlin and the Android lifecycle. This is a short note on why we made the move and how
it looks in practice.

## What MVP cost us

Our MVP setup looked clean on paper: a Presenter per screen, a View interface, a Model
behind a use case. In practice, three things kept biting us.

- **State was scattered.** A screen's state lived across the Presenter's fields, the
  View's widgets, and a few flags in the Model. Reproducing a bug meant reproducing a
  combination, not a value.
- **The View talked back too much.** `view.showLoading()`, `view.showError()`,
  `view.hideError()`, `view.showContent()` — the Presenter ended up driving the UI step
  by step instead of describing it.
- **Lifecycle leaks were a constant.** Presenters outlived the View on rotation; the
  View came back without its previous state; we patched it screen by screen.

By the third or fourth time we wrote the same "restore state after rotation" code, we
agreed it was time for something else.

## What MVI gave us

MVI flips the relationship. Instead of the Presenter calling methods on the View, the
View **renders a single state object**, and that state can only be changed by emitting
an **intent**. Three rules:

1. **One state per screen.** Everything the screen needs to render lives in one
   immutable `State` data class.
2. **State changes only through reducers.** An intent (user action, result, error)
   goes through a pure `(State, Intent) -> State` function — same idea as a Redux
   reducer.
3. **Side effects are isolated.** Network calls, database writes, navigation events
   live outside the reducer and are turned back into intents when they finish.

The result is a screen that's basically a function: `state -> UI`. Bugs become
reproducible because the state is one value, not a constellation.

## How it looks in Kotlin

Roughly:

```kotlin
data class SearchState(
    val query: String = "",
    val items: List<Item> = emptyList(),
    val loading: Boolean = false,
    val error: Throwable? = null,
)

sealed class SearchIntent {
    data class QueryChanged(val q: String) : SearchIntent()
    object Submit : SearchIntent()
    data class ResultsLoaded(val items: List<Item>) : SearchIntent()
    data class Failed(val cause: Throwable) : SearchIntent()
}

fun reduce(state: SearchState, intent: SearchIntent): SearchState = when (intent) {
    is QueryChanged   -> state.copy(query = intent.q)
    is Submit         -> state.copy(loading = true, error = null)
    is ResultsLoaded  -> state.copy(loading = false, items = intent.items)
    is Failed         -> state.copy(loading = false, error = intent.cause)
}
```

The screen subscribes to a stream of `SearchState` (we use **RxJava** today; we're
watching Kotlin **Flow**, which stabilized this fall) and re-renders on every emission.
Side effects — the actual network call triggered by `Submit` — live in a separate
"effect handler" that maps an intent to an observable of follow-up intents.

That's the whole pattern. There's no per-method dance with the View anymore.

---
title: Julia — Start Here
slug: julia-start-here
description: Install Julia, activate Mental Gym's project, and run a first program and Test testset from the repository root.
category: Languages
order: -6
status: stable
kind: concept
tags:
  - julia
  - foundations
---

# Julia — Start Here

This lesson gets one small Julia program running with the repository's project
selected. Keep the terminal in the repository root so `--project=.` consistently
selects its `Project.toml`.

## Install Julia

Use Julia's [official installation instructions](https://docs.julialang.org/en/v1/manual/installation/).
The recommended installer is Juliaup, which installs Julia and manages release
channels. Reopen your terminal after installation, then check that the launcher
is available:

```bash
julia --version
```

If you need a platform-specific binary instead, use the [official manual
downloads](https://julialang.org/downloads/manual-downloads/) page.

## Select the repository project

Change into your clone and confirm both the working directory and active Julia
project:

```bash
cd /path/to/mental-gym
git rev-parse --show-toplevel
julia --project=. -e 'println(VERSION); println(Base.active_project())'
```

The last line should print a Julia version and a path ending in
`mental-gym/Project.toml`. This lesson uses only Base and the standard library,
so it needs no additional packages. Some existing algorithm ports import
packages such as `DataStructures`. Before running those ports, install the
project dependencies:

```bash
julia --project=. -e 'using Pkg; Pkg.instantiate()'
```

## Keep experiments in an ignored scratch directory

The repository ignores `build/`, so use it for disposable practice files. From
the repository root:

```bash
mkdir -p build/scratch
```

Create `build/scratch/julia_first.jl`:

```julia
function normalize_scores(scores::AbstractVector{<:Real})
    isempty(scores) && throw(ArgumentError("scores must not be empty"))

    maximum_score = maximum(scores)
    maximum_score > 0 || throw(ArgumentError("maximum score must be positive"))

    return round.(scores ./ maximum_score; digits=2)
end

function main()
    println(normalize_scores([2, 3, 4]))
    return nothing
end

if abspath(PROGRAM_FILE) == @__FILE__
    main()
end
```

Run it with the repository project selected:

```bash
julia --project=. build/scratch/julia_first.jl
```

Expected output:

```text
[0.5, 0.75, 1.0]
```

The `PROGRAM_FILE` guard calls `main()` when this file is the program, while
allowing a test to `include` the function without printing the example.

## Add one testset

Create `build/scratch/test_julia_first.jl`:

```julia
using Test

include("julia_first.jl")

@testset "normalize_scores" begin
    @test normalize_scores([2, 3, 4]) == [0.5, 0.75, 1.0]
    @test_throws ArgumentError normalize_scores(Int[])
end
```

Run the test file from the repository root:

```bash
julia --project=. build/scratch/test_julia_first.jl
```

The summary should show two passing tests, and the command should exit with
status code 0.

## Troubleshooting

- **`julia: command not found`:** finish the Juliaup setup, open a new terminal,
  and confirm `julia --version` before returning to the repository.
- **The active project is not this repository:** `cd` to the path printed by
  `git rev-parse --show-toplevel`, then keep `--project=.` in the command.
- **A package is missing:** run `Pkg.instantiate()` with the command above. The
  first installation can take time because packages must be downloaded and
  prepared.
- **`include("julia_first.jl")` cannot find the file:** keep the program and test
  together in `build/scratch/` with the filenames shown.
- **Code works in the REPL but not in the file:** restart with a clean command
  and make every required definition or `using` statement explicit in the file.

Next, learn the core language model in [Julia Essentials](../julia-essentials/),
then return to the [Julia learning track](../../learn/julia/).

## Official references

- [Julia installation](https://docs.julialang.org/en/v1/manual/installation/)
- [Julia: Getting Started](https://docs.julialang.org/en/v1/manual/getting-started/)
- [Julia command-line interface](https://docs.julialang.org/en/v1/manual/command-line-interface/)
- [Julia `Test` standard library](https://docs.julialang.org/en/v1/stdlib/Test/)

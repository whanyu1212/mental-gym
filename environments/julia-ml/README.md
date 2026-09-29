# Julia ML environment

The repository root Julia environment stays small so algorithm tests only
install the packages they use. Activate this separate environment for notebooks,
benchmarking, data work, plotting, MLJ, or Turing:

```bash
julia --project=environments/julia-ml -e 'using Pkg; Pkg.instantiate()'
julia --project=environments/julia-ml
```

Commit changes to both `Project.toml` and `Manifest.toml` when adding or updating
dependencies in this environment.

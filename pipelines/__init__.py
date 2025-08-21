import importlib
import os

files = [f for f in os.listdir(os.path.dirname(__file__)) if not f.startswith("_")]

pipelines = {}
for f in files:
    lib = importlib.import_module(f"{os.path.splitext(f)[0]}")
    pipelines[lib.NAME] = lib.initPipeline()
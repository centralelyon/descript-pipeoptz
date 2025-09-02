import importlib
import os, sys

# import loss

PATH = os.path.dirname(os.path.abspath(__file__))
files = [f for f in os.listdir(PATH) if not f.startswith("_") and f!="loss.py"]

sys.path.insert(1, os.path.abspath(f"{PATH}/../pipelines/"))
from loss import loss

pipelines = {}
parameters = {}
sys.path.insert(1, os.path.abspath(f"{PATH}/../pipelines/"))
for f in files:
    lib = importlib.import_module(f"{os.path.splitext(f)[0]}")
    p = lib.initPipeline()
    pipelines[p.name] = p
    parameters[p.name] = lib.initParameters()
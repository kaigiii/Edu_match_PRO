import google.adk
import inspect
import pkgutil
import importlib

def find_class(module, class_name):
    if hasattr(module, class_name):
        return getattr(module, class_name)
    
    if hasattr(module, "__path__"):
        for _, name, _ in pkgutil.iter_modules(module.__path__):
            try:
                submodule = importlib.import_module(f"{module.__name__}.{name}")
                res = find_class(submodule, class_name)
                if res:
                    print(f"Found {class_name} in {submodule.__name__}")
                    return res
            except:
                pass
    return None

find_class(google.adk, "Content")

from setuptools import find_packages, setup

setup(
    name="backend",
    version="1.0.0",
    packages=find_packages(include=["core", "clinic"]),
)

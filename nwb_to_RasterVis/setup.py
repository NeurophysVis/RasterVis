#!/usr/bin/env python3

from setuptools import find_packages, setup

INSTALL_REQUIRES = ['numpy', 'pynwb']
TESTS_REQUIRE = ['pytest >= 2.7.1']

setup(
    name='nwb_to_RasterVis',
    version='0.1.0.dev0',
    license='MIT',
    description=(''),
    author='Eric Denovellis',
    author_email='Eric.Denovellis@ucsf.edu',
    packages=find_packages(),
    install_requires=INSTALL_REQUIRES,
    python_requires='>3.6',
    tests_require=TESTS_REQUIRE,
)

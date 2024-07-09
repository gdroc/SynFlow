# SynFlow

## Description

SynFlow is a web application that allows you to visualize the alignment of genomes and their structural variations using SyRI data. The application supports interactive features such as zooming, panning, and filtering of bands by type and length.

## Features

- Upload and visualize chromosome length and band files
- Interactive zoom and pan
- Filter bands by type and length
- Stack chromosomes vertically or align them horizontally
- Download the visualization as an SVG file

## Usage

1. Upload the chromosome length files and band files using the form.
| File Name      | File Description                                          |
|----------------|-----------------------------------------------------------|
| `*.chrlen`     | Table containing chromosome lengths                       |
| `*syri.out`    | Pairwise structural annotation information between genomes|

2. Select the "Stack chromosomes vertically" checkbox if you want to stack the chromosomes.
3. Click on the "Draw" button to generate the visualization.
4. Use the zoom and pan features to explore the visualization.
5. Filter the bands using the legend and the slider.
6. Download the visualization as an SVG file by clicking the "Download SVG" button.

## License

This project is licensed under the terms of the GNU General Public License v3.0. See the [LICENSE](./LICENSE) file for details.

## Authors

- **Marilyne Summo** - *Initial work* - [GitHub Profile](https://github.com/SouthGreenPlatform)

See also the list of [contributors](https://github.com/SouthGreenPlatform/SynFlow/contributors) who participated in this project.

## Acknowledgements

- Special thanks to the contributors of the [SyRI tool](https://github.com/schneebergerlab/syri).
- Inspiration from [plotsr](https://github.com/schneebergerlab/plotsr).


# Cell Guide 🧭 

Navigate single-cell RNA-seq datasets in your web browser.

Try it at https://cell.guide


### Features

- Display metadata on the UMAP figure
- Display gene expression on the UMAP figure
- Aggregate statistics for cell clusters and metadata categories
- Find any gene, instantly
- Browse statistics for every gene

<table>
  <tr>
    <td width="20%">Flip through donor variables and see them in low-dimensional space.</td>
    <td>
      <p align="center">
        <img src="https://i.imgur.com/tcYRggc.gif" width="80%" align="center" />
      </p>
    </td>
  </tr>
</table>
<table>
  <tr>
  <td width="20%">Select any gene and see expression across clusters and donor variables.</td>
  <td>
    <p align="center">
      <img src="https://i.imgur.com/4Ovpb5Z.gif" width="80%" align="center" />
    </p>
  </td>
  </tr>
</table>

Demo scRNA-seq data from the research article by [Smillie et al. 2019][3].

[3]: https://doi.org/10.1016/j.cell.2019.06.029


## Quick Start

### Step 1. Install Cell Browser

We can install the Cell Browser Python package with pip:

```
pip install cellbrowser
```

Or see the [Cell Browser installation instructions](https://cellbrowser.readthedocs.io/installation.html).

### Step 2. Create a browser for your data

See the [documentation][1] for how to create a Cell Browser for your data.

When your browser is working, it should look something like this:

<p align="center">
<img src="https://i.imgur.com/RkM4V34.png" width="80%" align="center" />
</p>

### Step 3. Copy Cell Guide files

```
TODO
```

Make sure to refresh your web browser with <kbd>⌘</kbd>+<kbd>Shift</kbd>+<kbd>R</kbd> (or <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>R</kbd> on Windows).

[1]: https://cellbrowser.readthedocs.io/basic_usage.html


## Dependencies

The current version of Cell Guide depends on [Cell Browser] by [Maximilian
Haeussler].

[Cell Browser]: https://github.com/maximilianh/cellBrowser
[Maximilian Haeussler]: https://github.com/maximilianh

Built with:

- [Bootstrap](https://getbootstrap.com)
- [CSS loaders](https://projects.lukehaas.me/css-loaders/)
- [d3-legend](https://github.com/susielu/d3-legend)
- [D3.js](https://d3js.org)
- [FastBitSet](https://github.com/lemire/FastBitSet.js/)
- [hcluster.js](https://github.com/cmpolis/hcluster.js/)
- [jQuery](https://jquery.com)
- [JSURL2](https://www.npmjs.com/package/@yaska-eu/jsurl2)
- [pako](https://github.com/nodeca/pako)
- [palette.js](https://github.com/google/palette.js/tree/master)
- [papaparse](https://www.papaparse.com/)
- [tablesort](https://github.com/tristen/tablesort)


Let me know what you think! [@slowkow](https://twitter.com/slowkow)


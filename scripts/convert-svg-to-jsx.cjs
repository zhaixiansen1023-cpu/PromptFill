const fs = require('fs');
const path = require('path');

function convertSvgToJsx(svgPath, outPath, componentName) {
    let svg = fs.readFileSync(svgPath, 'utf8');
    
    // Remove xml declaration if present
    svg = svg.replace(/<\?xml.*?\?>/g, '');
    
    // Convert attributes to camelCase
    const replacements = [
        ['clip-path', 'clipPath'],
        ['clip-rule', 'clipRule'],
        ['fill-opacity', 'fillOpacity'],
        ['fill-rule', 'fillRule'],
        ['stroke-width', 'strokeWidth'],
        ['color-interpolation-filters', 'colorInterpolationFilters'],
        ['flood-opacity', 'floodOpacity'],
        ['stop-color', 'stopColor'],
        ['stop-opacity', 'stopOpacity'],
        ['stroke-linecap', 'strokeLinecap'],
        ['stroke-linejoin', 'strokeLinejoin'],
        ['stroke-opacity', 'strokeOpacity']
    ];

    replacements.forEach(([oldAttr, newAttr]) => {
        const regex = new RegExp(`${oldAttr}=`, 'g');
        svg = svg.replace(regex, `${newAttr}=`);
    });

    // Replace style="mix-blend-mode:passthrough" with style={{ mixBlendMode: "passthrough" }}
    svg = svg.replace(/style="mix-blend-mode:passthrough"/g, 'style={{ mixBlendMode: "passthrough" }}');

    // Replace width/height if present with size prop optionally, but let's keep them static first to match EXACT sizes
    // Just replace with JSX variables if needed.
    
    // Replace double quotes value with curly braces for numbers in SVG if needed, but strings are fine in JSX for path data
    // React handles strings fine.

    // Inject className and props into <svg>
    svg = svg.replace(/<svg\s/, '<svg className={className} {...props} ');

    // Wrap in component
    const template = `import React from 'react';

export const ${componentName} = ({ className = "", ...props }) => {
    return (
        ${svg.trim()}
    );
};
`;

    fs.writeFileSync(outPath, template);
    console.log(`Converted ${svgPath} to ${outPath}`);
}

// Convert files
const assetsDir = path.join(__dirname, '..', 'src', 'assets');
const iconsDir = path.join(__dirname, '..', 'src', 'components', 'icons');

// Logo
convertSvgToJsx(
    path.join(assetsDir, 'Logo_icon.svg'),
    path.join(iconsDir, 'LogoIcon.jsx'),
    'LogoIcon'
);

// Title
convertSvgToJsx(
    path.join(assetsDir, 'icons', 'Title.svg'),
    path.join(iconsDir, 'TitleIcon.jsx'),
    'TitleIcon'
);

// Title Dark
convertSvgToJsx(
    path.join(assetsDir, 'icons', 'Title_Dark.svg'),
    path.join(iconsDir, 'TitleDarkIcon.jsx'),
    'TitleDarkIcon'
);

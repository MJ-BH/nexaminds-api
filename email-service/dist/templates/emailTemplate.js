"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const renderTemplate = (name, url) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
            .header { background-color: #f85f40; color: white; padding: 10px; text-align: center; }
            .btn { display: inline-block; background-color: #f85f40; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Your Record is Ready</h1>
            </div>
            <p>Hello <strong>${name}</strong>,</p>
            <p>Your URL has been generated successfully:</p>
            <a href="${url}" class="btn">View Record</a>
            <p><small>Link: ${url}</small></p>
        </div>
    </body>
    </html>
    `;
};
exports.default = renderTemplate;

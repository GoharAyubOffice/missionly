import React from 'react';

export function DesignSystemTest() {
  return (
    <div className="p-8 space-y-8 bg-background-secondary min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Typography Test */}
        <section className="card">
          <h2 className="text-h2 text-text-primary mb-6">Typography System</h2>
          <div className="space-y-4">
            <h1 className="text-h1 text-text-primary">H1: Page Title (32px)</h1>
            <h2 className="text-h2 text-text-primary">H2: Section Header (28px)</h2>
            <h3 className="text-h3 text-text-primary">H3: Subsection (24px)</h3>
            <h4 className="text-h4 text-text-primary">H4: Component Title (20px)</h4>
            <p className="text-body-large text-text-primary">Body Large: Important information (18px)</p>
            <p className="text-body text-text-primary">Body: Standard text for most UI elements (16px)</p>
            <p className="text-body-small text-text-secondary">Body Small: Secondary information and metadata (14px)</p>
            <p className="text-caption text-text-muted">Caption: Timestamps and micro-labels (12px)</p>
          </div>
        </section>

        {/* Color Palette Test */}
        <section className="card">
          <h2 className="text-h2 text-text-primary mb-6">Color Palette</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Primary Colors */}
            <div className="space-y-2">
              <h4 className="text-label text-text-primary">Primary</h4>
              <div className="w-full h-16 bg-primary-blue rounded-button"></div>
              <p className="text-caption text-text-muted">#1B4F72</p>
            </div>
            
            {/* Secondary Colors */}
            <div className="space-y-2">
              <h4 className="text-label text-text-primary">Secondary</h4>
              <div className="w-full h-16 bg-secondary-blue-light rounded-button"></div>
              <p className="text-caption text-text-muted">#3498DB</p>
            </div>
            
            {/* Success */}
            <div className="space-y-2">
              <h4 className="text-label text-text-primary">Success</h4>
              <div className="w-full h-16 bg-success rounded-button"></div>
              <p className="text-caption text-text-muted">#2ECC71</p>
            </div>
            
            {/* Warning */}
            <div className="space-y-2">
              <h4 className="text-label text-text-primary">Warning</h4>
              <div className="w-full h-16 bg-accent-orange rounded-button"></div>
              <p className="text-caption text-text-muted">#F39C12</p>
            </div>
          </div>
        </section>

        {/* Button System Test */}
        <section className="card">
          <h2 className="text-h2 text-text-primary mb-6">Button System</h2>
          <div className="flex flex-wrap gap-4">
            <button className="btn btn-primary">Primary Button</button>
            <button className="btn btn-secondary">Secondary Button</button>
            <button className="btn btn-success">Success Button</button>
            <button className="btn btn-warning">Warning Button</button>
            <button className="btn btn-text">Text Button</button>
            <button className="btn btn-primary" disabled>Disabled Button</button>
          </div>
        </section>

        {/* Input System Test */}
        <section className="card">
          <h2 className="text-h2 text-text-primary mb-6">Input System</h2>
          <div className="space-y-4 max-w-md">
            <div>
              <label className="text-label text-text-primary block mb-2">Standard Input</label>
              <input 
                type="text" 
                className="input w-full" 
                placeholder="Enter your text here..."
              />
            </div>
            <div>
              <label className="text-label text-text-primary block mb-2">Search Input</label>
              <input 
                type="search" 
                className="search-input input w-full" 
                placeholder="Search bounties..."
              />
            </div>
          </div>
        </section>

        {/* Card System Test */}
        <section className="space-y-6">
          <h2 className="text-h2 text-text-primary">Card System</h2>
          
          {/* Standard Card */}
          <div className="card">
            <h3 className="text-h3 text-text-primary mb-4">Standard Card</h3>
            <p className="text-body text-text-secondary">
              This is a standard card with default styling, including shadows, padding, and border radius.
            </p>
          </div>
          
          {/* Bounty Card */}
          <div className="bounty-card">
            <h3 className="text-h3 text-text-primary mb-2">Bounty Card</h3>
            <p className="text-body-small text-text-secondary mb-4">
              This is a bounty card with hover effects and specific styling for bounty listings.
            </p>
            <div className="flex items-center justify-between">
              <span className="text-button text-primary-blue">$500 USD</span>
              <span className="text-caption text-success">Open</span>
            </div>
          </div>
        </section>

        {/* Progress Bar Test */}
        <section className="card">
          <h2 className="text-h2 text-text-primary mb-6">Progress Indicators</h2>
          <div className="space-y-4">
            <div>
              <p className="text-label text-text-primary mb-2">Default Progress (75%)</p>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '75%' }}></div>
              </div>
            </div>
            <div>
              <p className="text-label text-text-primary mb-2">Success Progress (100%)</p>
              <div className="progress-bar">
                <div className="progress-fill success" style={{ width: '100%' }}></div>
              </div>
            </div>
            <div>
              <p className="text-label text-text-primary mb-2">Warning Progress (45%)</p>
              <div className="progress-bar">
                <div className="progress-fill warning" style={{ width: '45%' }}></div>
              </div>
            </div>
          </div>
        </section>

        {/* Spacing System Test */}
        <section className="card">
          <h2 className="text-h2 text-text-primary mb-6">Spacing System</h2>
          <div className="space-y-4">
            <div className="bg-secondary-blue-pale p-2 rounded">2px - Micro spacing</div>
            <div className="bg-secondary-blue-pale p-4 rounded">4px - Minimal spacing</div>
            <div className="bg-secondary-blue-pale p-8 rounded">8px - Small spacing</div>
            <div className="bg-secondary-blue-pale p-12 rounded">12px - Compact spacing</div>
            <div className="bg-secondary-blue-pale p-16 rounded">16px - Default spacing</div>
            <div className="bg-secondary-blue-pale p-24 rounded">24px - Medium spacing</div>
          </div>
        </section>
      </div>
    </div>
  );
}
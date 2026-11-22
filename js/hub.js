/**
 * VideoForge Pro - Project Hub Space
 * Pre-editor workspace: saved projects + media gallery vault.
 */
import { Storage } from './storage.js';
import { Player } from './player.js';
import { SubtitlesManager } from './subtitles.js';
import { FilterEngine } from './filters.js';
import { Timeline } from './timeline.js';

export const Hub = {
  _galleryFilter: 'all',

  async init(app) {
    this.app = app;
    await Storage.init();
    await this._seedIfEmpty();
    this._bindHubEvents();
    await this.render();
  },

  async render() {
    await this._renderProjects();
    await this._renderGallery();
  },

  show() {
    if (Player.video && !Player.video.paused) {
      Player.video.pause();
      Player.isPlaying = false;
      if (Player.onPlayStateChange) Player.onPlayStateChange(false);
    }
    document.getElementById('project-hub-space').style.display = 'flex';
    document.getElementById('editor-space').style.display = 'none';
    document.getElementById('navBtnHub').classList.add('on');
    document.getElementById('navBtnEditor').classList.remove('on');
    this.render();
  },

  showEditor() {
    document.getElementById('project-hub-space').style.display = 'none';
    document.getElementById('editor-space').style.display = 'flex';
    document.getElementById('navBtnHub').classList.remove('on');
    document.getElementById('navBtnEditor').classList.add('on');
    window.dispatchEvent(new Event('resize'));
  },

  async _seedIfEmpty() {
    const existing = await Storage.getProjects();
    if (existing.length === 0) {
      await Storage.saveProject({
        id: 'demo_tiktok',
        title: 'Viral TikTok Reel (9:16)',
        aspectRatio: '9:16',
        duration: 12.0,
        description: 'Neon karaoke subtitles + beat-synced vertical edit',
        cuesCount: 4,
        updatedAt: Date.now() - 3600000 * 3,
        projectData: {
          filters: { activeLUT: 'cyberpunk', brightness: 8, contrast: 15, saturation: 30, aspectRatio: '9:16' },
          subtitles: {
            style: { font: 'Anton', size: 38, color: '#e8ff47', motion: 'karaoke', positionY: 0.82 },
            cues: [
              { id: 1, start: 0.5, end: 2.8, text: 'Are you ready for this' },
              { id: 2, start: 3.0, end: 5.5, text: 'Watch the transformation unfold' },
              { id: 3, start: 5.8, end: 8.5, text: 'Ultra-sharp 4K clarity' },
              { id: 4, start: 9.0, end: 11.5, text: 'Create your story today' }
            ]
          },
          timeline: { beatMarkers: [1.2, 3.1, 5.1, 7.1, 9.1, 11.1] }
        }
      });
      await Storage.saveProject({
        id: 'demo_cinematic',
        title: 'Cinematic Landscape Teaser',
        aspectRatio: '16:9',
        duration: 15.0,
        description: 'Teal & Orange LUT with cinematic fade subtitles and stabilization',
        cuesCount: 3,
        updatedAt: Date.now() - 3600000 * 24,
        projectData: {
          filters: { activeLUT: 'teal-orange', brightness: -2, contrast: 18, saturation: 10, aspectRatio: '16:9' },
          subtitles: {
            style: { font: 'Syne', size: 32, color: '#f4f4fb', motion: 'fade-slide', positionY: 0.86 },
            cues: [
              { id: 1, start: 1.0, end: 4.5, text: 'In a world shaped by motion' },
              { id: 2, start: 5.0, end: 9.5, text: 'Every frame reveals a mystery' },
              { id: 3, start: 10.0, end: 14.0, text: 'Experience the full journey' }
            ]
          },
          timeline: { beatMarkers: [2.0, 5.0, 8.0, 11.0, 14.0] }
        }
      });
    }

    const gallery = await Storage.getGallery();
    if (gallery.length === 0) {
      await Storage.saveGalleryItem({ id: 'g_logo', name: 'Studio Watermark Logo', type: 'image', category: 'image', sizeStr: '42 KB', tag: 'Watermark', createdAt: Date.now() });
      await Storage.saveGalleryItem({ id: 'g_synth', name: 'Cyber Synth Loop.wav', type: 'audio', category: 'audio', sizeStr: '1.4 MB', durationStr: '0:15', tag: 'BG Music', createdAt: Date.now() });
    }
  },

  async _renderProjects() {
    const grid = document.getElementById('hubProjectsGrid');
    if (!grid) return;
    const projects = await Storage.getProjects();

    let activeBannerHTML = '';
    if (Player.isLoaded) {
      activeBannerHTML = `
        <div style="grid-column:1/-1;display:flex;align-items:center;justify-content:space-between;padding:12px 18px;background:linear-gradient(90deg,rgba(232,255,71,.12),rgba(71,184,255,.08));border:1px solid rgba(232,255,71,.35);border-radius:12px;margin-bottom:8px">
          <div style="display:flex;align-items:center;gap:10px">
            <span style="font-size:18px">⚡</span>
            <div>
              <div style="font-size:13px;font-weight:700;color:#fff">Active Project in Studio</div>
              <div style="font-size:11px;color:var(--txt-dim)">Duration: ${Timeline.formatTimecode(Timeline.duration || 12)} · ${SubtitlesManager.cues.length} Subtitles</div>
            </div>
          </div>
          <button class="hub-cta-btn primary" id="btnResumeActiveProject" style="padding:7px 16px;font-size:12px">
            Resume Editing Studio →
          </button>
        </div>`;
    }

    if (!projects.length && !Player.isLoaded) {
      grid.innerHTML = `<div class="hub-empty"><div style="font-size:40px;margin-bottom:12px">📂</div><h4>No Projects Yet</h4><p>Start a new project or import a .videoforge file</p></div>`;
      return;
    }

    const cardsHTML = projects.map(p => {
      const date = new Date(p.updatedAt || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      const ar = p.aspectRatio || '16:9';
      const dur = p.duration ? p.duration.toFixed(1) + 's' : '--';
      const cues = p.cuesCount || 0;
      return `
        <div class="hub-proj-card" data-id="${p.id}">
          <div class="hub-proj-thumb">
            <span class="hub-ar-tag">${ar}</span>
            <svg viewBox="0 0 24 24" width="28" height="28" fill="#e8ff47"><polygon points="6 3 20 12 6 21 6 3"/></svg>
            <span class="hub-dur-tag">${dur}</span>
          </div>
          <div class="hub-proj-body">
            <div class="hub-proj-title" title="${p.title}">${p.title}</div>
            <div class="hub-proj-meta">${date} · 💬 ${cues} subs</div>
            <div class="hub-proj-actions">
              <button class="btn-proj-open" data-id="${p.id}">Open in Studio →</button>
              <button class="btn-proj-del" data-id="${p.id}" title="Delete">✕</button>
            </div>
          </div>
        </div>`;
    }).join('');

    grid.innerHTML = activeBannerHTML + cardsHTML;

    document.getElementById('btnResumeActiveProject')?.addEventListener('click', () => {
      this.showEditor();
    });

    grid.querySelectorAll('.btn-proj-open').forEach(btn =>
      btn.addEventListener('click', async (e) => {
        const proj = projects.find(p => p.id === e.target.dataset.id);
        if (proj) await this._loadProject(proj);
      })
    );
    grid.querySelectorAll('.hub-proj-thumb').forEach(thumb =>
      thumb.parentElement.addEventListener('dblclick', async (e) => {
        const id = e.currentTarget.dataset.id;
        const proj = projects.find(p => p.id === id);
        if (proj) await this._loadProject(proj);
      })
    );
    grid.querySelectorAll('.btn-proj-del').forEach(btn =>
      btn.addEventListener('click', async (e) => {
        const id = e.target.dataset.id;
        const proj = projects.find(p => p.id === id);
        if (proj && confirm(`Delete "${proj.title}"?`)) {
          await Storage.deleteProject(id);
          await this._renderProjects();
          this.app.toast('Project deleted');
        }
      })
    );
  },

  async _loadProject(proj) {
    this.app.toast(`Loading "${proj.title}"…`);
    this.showEditor();

    if (proj.projectData?.filters) {
      const f = proj.projectData.filters;
      if (f.activeLUT) FilterEngine.activeLUT = f.activeLUT;
      if (f.brightness !== undefined) FilterEngine.brightness = f.brightness;
      if (f.contrast !== undefined) FilterEngine.contrast = f.contrast;
      if (f.saturation !== undefined) FilterEngine.saturation = f.saturation;
      if (f.aspectRatio) {
        FilterEngine.aspectRatio = f.aspectRatio;
        const select = document.getElementById('aspectRatioSelect');
        if (select) select.value = f.aspectRatio;
      }
      this.app.renderFilterGallery();
    }

    if (proj.projectData?.subtitles) {
      const { style, cues } = proj.projectData.subtitles;
      if (style) Object.assign(SubtitlesManager.style, style);
      if (cues) SubtitlesManager.cues = JSON.parse(JSON.stringify(cues));
      this.app.renderSubtitlesList();
    }

    if (proj.projectData?.timeline?.beatMarkers) {
      Timeline.setBeatMarkers(proj.projectData.timeline.beatMarkers);
    }

    if (!Player.isLoaded) this.app.loadSampleDemo();
    else if (proj.duration) Timeline.setDuration(proj.duration);

    this.app.toast(`⚡ "${proj.title}" loaded`);
  },

  async _renderGallery() {
    const grid = document.getElementById('hubGalleryGrid');
    if (!grid) return;
    let items = await Storage.getGallery();
    if (this._galleryFilter !== 'all') items = items.filter(it => it.category === this._galleryFilter || it.type === this._galleryFilter);

    if (!items.length) {
      grid.innerHTML = `<div class="hub-empty" style="grid-column:1/-1"><div style="font-size:40px;margin-bottom:12px">🎞️</div><h4>Gallery Empty</h4><p>Import media assets to store them here</p></div>`;
      return;
    }

    grid.innerHTML = items.map(it => {
      const icon = it.type === 'audio' ? '🎵' : it.type === 'image' ? '🖼️' : '🎬';
      return `
        <div class="hub-gallery-card" data-id="${it.id}">
          <div class="hub-gallery-thumb">${icon}</div>
          <div class="hub-gallery-body">
            <div class="hub-gallery-name" title="${it.name}">${it.name}</div>
            <div class="hub-gallery-meta">${it.sizeStr || ''} ${it.durationStr ? '· ' + it.durationStr : ''}</div>
            <div style="display:flex;gap:6px;margin-top:6px">
              <button class="btn-gallery-preview" data-id="${it.id}" style="padding:5px 8px;background:rgba(71,184,255,.12);color:#47b8ff;border:1px solid rgba(71,184,255,.3);border-radius:6px;cursor:pointer;font-size:11px" title="Preview asset">▶</button>
              <button class="btn-gallery-insert" data-id="${it.id}" style="flex:1;padding:5px 8px;background:rgba(232,255,71,.12);color:#e8ff47;border:1px solid rgba(232,255,71,.3);border-radius:6px;cursor:pointer;font-size:11px">Use in Studio</button>
              <button class="btn-gallery-del" data-id="${it.id}" title="Remove" style="padding:5px 8px;background:rgba(255,71,87,.1);color:#ff4757;border:1px solid rgba(255,71,87,.25);border-radius:6px;cursor:pointer;font-size:11px">✕</button>
            </div>
          </div>
        </div>`;
    }).join('');

    const allItems = await Storage.getGallery();
    grid.querySelectorAll('.btn-gallery-preview').forEach(btn => {
      btn.addEventListener('click', () => {
        const it = allItems.find(x => x.id === btn.dataset.id);
        if (it) {
          if (it.type === 'audio') {
            AudioStudio.playSynthesizedSFX('whoosh');
            this.app.toast(`🎵 Previewing: ${it.name}`);
          } else {
            this.app.toast(`Selected: ${it.name}`);
          }
        }
      });
    });
    grid.querySelectorAll('.btn-gallery-insert').forEach(btn => {
      btn.addEventListener('click', () => {
        const it = allItems.find(x => x.id === btn.dataset.id);
        if (it) { this.showEditor(); this.app.toast(`Inserted "${it.name}" into Studio`); }
      });
    });
    grid.querySelectorAll('.btn-gallery-del').forEach(btn => {
      btn.addEventListener('click', async () => {
        const it = allItems.find(x => x.id === btn.dataset.id);
        if (it && confirm(`Remove "${it.name}" from gallery?`)) {
          await Storage.deleteGalleryItem(it.id);
          await this._renderGallery();
        }
      });
    });
  },

  async handleGalleryUpload(files) {
    for (const file of Array.from(files)) {
      const type = file.type.startsWith('video') ? 'video' : file.type.startsWith('audio') ? 'audio' : 'image';
      await Storage.saveGalleryItem({
        name: file.name,
        type,
        category: type,
        sizeStr: (file.size / 1048576).toFixed(1) + ' MB',
        tag: type === 'audio' ? 'Audio Track' : type === 'video' ? 'B-Roll Clip' : 'Graphic Overlay',
        createdAt: Date.now()
      });
    }
    await this._renderGallery();
    this.app.toast(`Added ${files.length} item(s) to Gallery`);
  },

  async saveCurrentToHub() {
    const title = prompt('Project name:', `My Project — ${new Date().toLocaleDateString()}`);
    if (!title?.trim()) return;
    await Storage.saveProject({
      id: 'proj_' + Date.now(),
      title: title.trim(),
      aspectRatio: FilterEngine.aspectRatio || '16:9',
      duration: Timeline.duration || 12,
      cuesCount: SubtitlesManager.cues.length,
      updatedAt: Date.now(),
      projectData: {
        filters: {
          activeLUT: FilterEngine.activeLUT,
          brightness: FilterEngine.brightness,
          contrast: FilterEngine.contrast,
          saturation: FilterEngine.saturation,
          aspectRatio: FilterEngine.aspectRatio
        },
        subtitles: {
          style: { ...SubtitlesManager.style },
          cues: JSON.parse(JSON.stringify(SubtitlesManager.cues))
        },
        timeline: { beatMarkers: [...(Timeline.beatMarkers || [])] }
      }
    });
    this.app.toast('💾 Saved to Project Hub!');
  },

  _bindHubEvents() {
    const $ = id => document.getElementById(id);

    // Nav tabs
    $('navBtnHub')?.addEventListener('click', () => this.show());
    $('navBtnEditor')?.addEventListener('click', () => this.showEditor());

    // New blank project
    $('hubBtnNewBlank')?.addEventListener('click', () => {
      SubtitlesManager.clearAllCues();
      this.showEditor();
      this.app.toast('✨ New project ready');
    });

    // Upload to start in editor
    const hubFileInput = $('hubFileInput');
    $('hubBtnUploadStart')?.addEventListener('click', () => hubFileInput?.click());
    hubFileInput?.addEventListener('change', e => {
      if (e.target.files?.[0]) {
        SubtitlesManager.clearAllCues();
        this.showEditor();
        Player.loadFromFile(e.target.files[0]);
        this.app.toast(`Loaded ${e.target.files[0].name}`);
      }
    });

    // Import project
    $('hubBtnImportProject')?.addEventListener('click', () => $('projectFileInput')?.click());

    // Gallery upload
    const galleryFileInput = $('hubGalleryFileInput');
    $('hubBtnUploadGallery')?.addEventListener('click', () => galleryFileInput?.click());
    galleryFileInput?.addEventListener('change', e => {
      if (e.target.files?.length) this.handleGalleryUpload(e.target.files);
    });

    // Save to Hub from nav
    $('navBtnSaveHub')?.addEventListener('click', () => this.saveCurrentToHub());

    // Gallery filter pills
    document.querySelectorAll('.hub-filter-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.hub-filter-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this._galleryFilter = btn.dataset.cat || 'all';
        this._renderGallery();
      });
    });
  }
};

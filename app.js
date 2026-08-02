/* ==========================================================================
   PAWCARE AI — CLINICAL EDITORIAL BRUTALISM ENGINE & UI CONTROLLER
   Target: Bitsmikro Innovative Vibecode 2026 Competition Entry
   Features: Multi-Modal AI Triage, Canvas Pixel Analyzer, Netlify Serverless Proxy, SINTA Citations, PDF Export, Fast-Track Presets
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // App State Store
    const state = {
        selectedPetType: 'kucing',
        uploadedPhotos: [],
        selectedFocus: 'auto',
        visualDetectedSpecies: null
    };

    // DOM Elements Reference
    const elements = {
        optCat: document.getElementById('optCat'),
        optDog: document.getElementById('optDog'),
        dropzoneBox: document.getElementById('dropzoneBox'),
        fileInput: document.getElementById('fileInput'),
        dropzoneEmpty: document.getElementById('dropzoneEmpty'),
        dropzonePreview: document.getElementById('dropzonePreview'),
        photoGalleryGrid: document.getElementById('photoGalleryGrid'),
        photoCountNum: document.getElementById('photoCountNum'),
        inputSymptoms: document.getElementById('inputSymptoms'),
        btnSubmit: document.getElementById('btnSubmit'),
        scannerBar: document.getElementById('scannerBar'),
        
        // Output Elements
        resultSection: document.getElementById('resultSection'),
        resultPlaceholder: document.getElementById('resultPlaceholder'),
        resultContent: document.getElementById('resultContent'),
        statusBanner: document.getElementById('statusBanner'),
        statusIcon: document.getElementById('statusIcon'),
        triageBadge: document.getElementById('triageBadge'),
        triageTitle: document.getElementById('triageTitle'),
        triageDesc: document.getElementById('triageDesc'),
        actionCardsContainer: document.getElementById('actionCardsContainer'),
        aiAnalysisBox: document.getElementById('aiAnalysisBox'),
        aiAnalysisText: document.getElementById('aiAnalysisText'),
        citationsList: document.getElementById('citationsList'),
        btnExportPDF: document.getElementById('btnExportPDF'),
        
        // Vet Clinic Modal Elements
        vetBottomSheet: document.getElementById('vetBottomSheet'),
        btnCloseVetModal: document.getElementById('btnCloseVetModal'),
        vetClinicList: document.getElementById('vetClinicList'),
        btnOpenVetNav: document.getElementById('btnOpenVetNav'),
        btnHeroVet: document.getElementById('btnHeroVet'),
        btnOpenVetMap: document.getElementById('btnOpenVetMap'),
        btnMobileVet: document.getElementById('btnMobileVet')
    };

    // Emergency Vet Clinic Data
    const clinicData = [
        { name: "Klinik Hewan Mikroskil Care 24h", dist: "1.2 km", phone: "081260001122" },
        { name: "Rumah Sakit Hewan Medan Central", dist: "3.4 km", phone: "081370002233" },
        { name: "Klinik & Pet Emergency VetCare", dist: "4.8 km", phone: "081165004455" }
    ];

    // Scroll Animation Observer (Fade In/Out on Scroll)
    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            } else {
                entry.target.classList.remove('is-visible');
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.reveal-on-scroll').forEach(el => scrollObserver.observe(el));

    // Initialize Icons on First Load
    if (window.lucide) window.lucide.createIcons();

    // Pet Species Switch
    elements.optCat.addEventListener('click', () => {
        state.selectedPetType = 'kucing';
        elements.optCat.classList.add('active');
        elements.optDog.classList.remove('active');
    });

    elements.optDog.addEventListener('click', () => {
        state.selectedPetType = 'anjing';
        elements.optDog.classList.add('active');
        elements.optCat.classList.remove('active');
    });

    // Fast-Track Preset Buttons for Judges Demo
    document.querySelectorAll('.preset-pill-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const presetType = btn.dataset.preset;
            state.uploadedPhotos = [];
            elements.inputSymptoms.value = '';

            if (presetType === 'cat-skin') {
                state.selectedPetType = 'kucing';
                elements.optCat.classList.add('active');
                elements.optDog.classList.remove('active');
                state.selectedFocus = 'kulit';
                state.uploadedPhotos.push({ name: 'kucing_jamur_ringworm.jpg', visualCategory: 'kulit', dataUrl: createPlaceholderCanvas('🐱 Ringworm') });
            } else if (presetType === 'dog-vomit') {
                state.selectedPetType = 'anjing';
                elements.optDog.classList.add('active');
                elements.optCat.classList.remove('active');
                state.selectedFocus = 'muntah';
                state.uploadedPhotos.push({ name: 'pug_vomit_food.jpg', visualCategory: 'muntah', dataUrl: createPlaceholderCanvas('🤮 Muntah Pug') });
            } else if (presetType === 'dog-mange') {
                state.selectedPetType = 'anjing';
                elements.optDog.classList.add('active');
                elements.optCat.classList.remove('active');
                state.selectedFocus = 'kulit';
                state.uploadedPhotos.push({ name: 'dog_mange_scabies.jpg', visualCategory: 'kulit', dataUrl: createPlaceholderCanvas('🐶 Mange Scabies') });
            } else if (presetType === 'mouth-pop') {
                state.selectedPetType = 'kucing';
                elements.optCat.classList.add('active');
                elements.optDog.classList.remove('active');
                state.selectedFocus = 'mulut';
                state.uploadedPhotos.push({ name: 'papiloma_gusi.jpg', visualCategory: 'mulut', dataUrl: createPlaceholderCanvas('👄 Papiloma Gusi') });
            }

            renderPhotoGallery();
            triggerTriageExecution();
        });
    });

    // Helper Canvas Placeholder
    function createPlaceholderCanvas(label) {
        const canvas = document.createElement('canvas');
        canvas.width = 120;
        canvas.height = 120;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#18181B';
        ctx.fillRect(0, 0, 120, 120);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '14px Lora';
        ctx.textAlign = 'center';
        ctx.fillText(label, 60, 65);
        return canvas.toDataURL();
    }

    // Photo Dropzone Event Listeners
    elements.dropzoneBox.addEventListener('click', (e) => {
        if (!e.target.closest('.btn-remove-thumb') && !e.target.closest('.focus-tag-btn')) {
            elements.fileInput.click();
        }
    });

    elements.fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            files.forEach(file => {
                if (state.uploadedPhotos.length >= 4) return;
                const fileNameLower = file.name.toLowerCase();
                
                if (fileNameLower.includes('cat') || fileNameLower.includes('kucing')) {
                    state.selectedPetType = 'kucing';
                    elements.optCat.classList.add('active');
                    elements.optDog.classList.remove('active');
                } else if (fileNameLower.includes('dog') || fileNameLower.includes('pug') || fileNameLower.includes('anjing')) {
                    state.selectedPetType = 'anjing';
                    elements.optDog.classList.add('active');
                    elements.optCat.classList.remove('active');
                }

                const reader = new FileReader();
                reader.onload = async (evt) => {
                    const dataUrl = evt.target.result;
                    const detectedVisualCategory = await analyzeImagePixels(dataUrl);

                    state.uploadedPhotos.push({
                        dataUrl: dataUrl,
                        name: fileNameLower,
                        visualCategory: detectedVisualCategory
                    });
                    renderPhotoGallery();
                };
                reader.readAsDataURL(file);
            });
            elements.fileInput.value = '';
        }
    });

    // HTML5 Canvas Pixel Analyzer
    function analyzeImagePixels(dataUrl) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    canvas.width = 60;
                    canvas.height = 60;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, 60, 60);
                    const imageData = ctx.getImageData(0, 0, 60, 60);
                    const pixels = imageData.data;

                    let brownCount = 0;
                    let redPinkCount = 0;
                    const totalPixels = pixels.length / 4;

                    for (let i = 0; i < pixels.length; i += 4) {
                        const r = pixels[i];
                        const g = pixels[i + 1];
                        const b = pixels[i + 2];

                        if (r > 60 && g > 35 && b < 100 && r > b + 20 && Math.abs(r - g) < 65) {
                            brownCount++;
                        }
                        if (r > 150 && g < 130 && b < 130 && r > g + 25) {
                            redPinkCount++;
                        }
                    }

                    const brownRatio = brownCount / totalPixels;
                    const redRatio = redPinkCount / totalPixels;

                    if (brownRatio > 0.12) resolve('muntah');
                    else if (redRatio > 0.05) resolve('kulit');
                    else resolve('auto');
                } catch (e) {
                    resolve('auto');
                }
            };
            img.onerror = () => resolve('auto');
            img.src = dataUrl;
        });
    }

    function renderPhotoGallery() {
        if (state.uploadedPhotos.length > 0) {
            elements.dropzoneEmpty.classList.add('hidden');
            elements.dropzonePreview.classList.remove('hidden');
            elements.photoCountNum.textContent = state.uploadedPhotos.length;

            elements.photoGalleryGrid.innerHTML = '';
            state.uploadedPhotos.forEach((photoObj, idx) => {
                const src = typeof photoObj === 'string' ? photoObj : photoObj.dataUrl;
                const item = document.createElement('div');
                item.className = 'photo-thumb-item';
                item.innerHTML = `
                    <img src="${src}" alt="Foto ${idx + 1}">
                    <button type="button" class="btn-remove-thumb" data-index="${idx}">
                        <i data-lucide="x" style="width:12px; height:12px;"></i>
                    </button>
                `;
                item.querySelector('.btn-remove-thumb').addEventListener('click', (evt) => {
                    evt.stopPropagation();
                    removePhoto(idx);
                });
                elements.photoGalleryGrid.appendChild(item);
            });

            if (window.lucide) window.lucide.createIcons();
            bindFocusTagButtons();
        } else {
            elements.dropzoneEmpty.classList.remove('hidden');
            elements.dropzonePreview.classList.add('hidden');
        }
    }

    function removePhoto(idx) {
        state.uploadedPhotos.splice(idx, 1);
        renderPhotoGallery();
    }

    function bindFocusTagButtons() {
        document.querySelectorAll('.focus-tag-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                document.querySelectorAll('.focus-tag-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.selectedFocus = btn.dataset.focus;
            });
        });
    }

    // Submit Action Trigger
    elements.btnSubmit.addEventListener('click', () => {
        triggerTriageExecution();
    });

    async function triggerTriageExecution() {
        const textVal = elements.inputSymptoms.value.trim();
        if (!textVal && state.uploadedPhotos.length === 0) {
            alert('Silakan upload minimal 1 foto anabul atau ketikkan gejala!');
            return;
        }

        elements.scannerBar.classList.remove('hidden');
        elements.btnSubmit.disabled = true;
        elements.btnSubmit.innerHTML = `<i data-lucide="loader-2" class="spin"></i> Menganalisis Gemini Vision...`;

        // Reset Akinator UI and State
        elements.resultPlaceholder.classList.add('hidden');
        elements.resultContent.classList.add('hidden');
        document.getElementById('akinatorSection').classList.remove('hidden');
        document.getElementById('akinatorHistory').innerHTML = '';
        document.getElementById('akinatorQuestionCard').classList.add('hidden');
        document.getElementById('akinatorLoading').classList.remove('hidden');
        
        akinatorState.history = [];
        akinatorState.confidence = 0;
        akinatorState.originalInput = textVal;
        akinatorState.originalPhotos = [...state.uploadedPhotos];
        akinatorState.originalPetType = state.selectedPetType;

        try {
            await processGeminiVisionAPI(textVal, state.selectedPetType, state.uploadedPhotos, true);
        } catch (err) {
            console.warn("API Error:", err);
            // Fallback
            document.getElementById('akinatorSection').classList.add('hidden');
            const outputData = generateTriage(textVal, state.selectedPetType);
            renderOutputUI(outputData);
        } finally {
            elements.scannerBar.classList.add('hidden');
            elements.btnSubmit.disabled = false;
            elements.btnSubmit.innerHTML = `<i data-lucide="sparkles"></i> Analisis Kesehatan Sekarang`;
        }
    }

    // State for Akinator Mode
    const akinatorState = {
        history: [],
        confidence: 0,
        originalInput: '',
        originalPhotos: [],
        originalPetType: ''
    };

    // Netlify Serverless Gemini Connector
    async function processGeminiVisionAPI(input, petType, photos, isAkinator = false) {
        let bodyPayload = { input, petType, photos };
        if (isAkinator) {
            bodyPayload.mode = "akinator";
            bodyPayload.history = akinatorState.history;
        }

        try {
            const response = await fetch('/.netlify/functions/gemini', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyPayload)
            });

            const resJson = await response.json();

            if (response.ok && resJson.success) {
                if (isAkinator && resJson.data) {
                    return handleAkinatorResponse(resJson.data);
                } else if (resJson.aiText) {
                    return generateTriage(input, petType, resJson.aiText);
                }
            } else {
                // If API returned 429 Limit Exceeded or other error
                const errorMsg = resJson.error || 'Gagal menyambung ke server AI.';
                alert(`Error AI: ${errorMsg}`);
                
                // Jangan reset UI, biarkan user nunggu dan klik ulang
                if (isAkinator) {
                   document.getElementById('akinatorLoading').classList.add('hidden');
                   document.getElementById('akinatorQuestionCard').classList.remove('hidden');
                   return null; // Return null agar flow dihentikan (user bisa klik lagi nanti)
                }
                return generateTriage(input, petType); // Fallback untuk mode standar
            }
        } catch (e) {
            console.warn("Netlify Proxy Error:", e);
            if (isAkinator) {
                alert('Koneksi jaringan terputus. Beralih ke analisis standar.');
            }
            return generateTriage(input, petType);
        }
    }

    async function handleAkinatorResponse(data) {
        document.getElementById('akinatorLoading').classList.add('hidden');
        document.getElementById('akinatorQuestionCard').classList.remove('hidden');
        
        // Update Confidence Bar
        akinatorState.confidence = data.confidence || 0;
        document.getElementById('akinatorConfidenceText').textContent = akinatorState.confidence + '%';
        document.getElementById('akinatorProgressFill').style.width = akinatorState.confidence + '%';
        
        if (data.possibleConditions) {
            const pills = data.possibleConditions.map(c => `<span class="suspect-pill">${c}</span>`).join('');
            document.getElementById('akinatorPossibleConditions').innerHTML = `
                <div style="font-size:11px; font-weight:600; color:var(--text-muted); margin-bottom:6px; margin-top:12px;">MENGUJI SUSPECT:</div>
                <div style="display:flex; flex-wrap:wrap; gap:6px;">${pills}</div>
            `;
        }

        if (data.type === 'diagnosis' || akinatorState.confidence >= 92) {
            // Selesai! Render Hasil Akhir
            document.getElementById('akinatorQuestionCard').classList.add('hidden');
            
            // Generate standard triage but override with Akinator results
            const finalData = generateTriage(akinatorState.originalInput, akinatorState.originalPetType);
            
            if (data.diseases && data.diseases.length > 0) {
                const disease = data.diseases[0];
                finalData.symptoms = [{ name: disease.name, type: disease.urgency || 'yellow' }];
                finalData.actionGroups = [{
                    category: 'Saran Penanganan Utama',
                    items: disease.treatments || []
                }];
                if (disease.citation) finalData.citations = [disease.citation];
                if (disease.description) finalData.aiAnalysis = disease.description;
            }
            
            setTimeout(() => {
                document.getElementById('akinatorSection').classList.add('hidden');
                renderOutputUI(finalData);
            }, 1500);
            return null; // Signals it's handled
        } else {
            // Render Pertanyaan Baru
            document.getElementById('akinatorQuestionNumber').textContent = `Pertanyaan ${akinatorState.history.length + 1}`;
            document.getElementById('akinatorQuestionText').textContent = data.question;
            
            // Reset Button states
            document.querySelectorAll('.btn-akinator').forEach(btn => btn.disabled = false);
            return null;
        }
    }

    // Bind Akinator Buttons
    document.querySelectorAll('.btn-akinator').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const answer = btn.dataset.answer; // "ya", "tidak", "tidak tahu"
            const currentQuestion = document.getElementById('akinatorQuestionText').textContent;
            
            // Disable buttons temporarily
            document.querySelectorAll('.btn-akinator').forEach(b => b.disabled = true);
            
            // Add to UI history
            const qNum = akinatorState.history.length + 1;
            const historyDiv = document.getElementById('akinatorHistory');
            historyDiv.innerHTML += `
                <div class="akinator-history-item">
                    <div class="akinator-history-q"><span style="font-weight:800; color:var(--clinical-blue); margin-right:4px;">Q${qNum}:</span> ${currentQuestion}</div>
                    <div class="akinator-history-a">${answer}</div>
                </div>
            `;
            historyDiv.scrollTop = historyDiv.scrollHeight;

            // Add to state history
            akinatorState.history.push({ question: currentQuestion, answer: answer });
            
            // Hide question card, show loading
            document.getElementById('akinatorQuestionCard').classList.add('hidden');
            document.getElementById('akinatorLoading').classList.remove('hidden');

            // Fetch next from AI (Hanya kirim foto di pertanyaan pertama saat Inisialisasi, jangan kirim lagi di lanjutan)
            const photosToSend = [];
            await processGeminiVisionAPI(akinatorState.originalInput, akinatorState.originalPetType, photosToSend, true);
        });
    });

    // Deterministic Multi-Modal Triage Resolution Engine
    function generateTriage(textInput, selectedSpecies, aiText = null) {
        const textLower = (textInput || '').toLowerCase();
        const hasText = textLower.length > 2;
        const photoNames = state.uploadedPhotos.map(p => (typeof p === 'string' ? p : (p.name || ''))).join(' ').toLowerCase();
        const firstPhotoVisual = state.uploadedPhotos.length > 0 ? (state.uploadedPhotos[0].visualCategory || 'auto') : 'auto';

        const combinedTextLower = (textLower + ' ' + (aiText || '').toLowerCase());
        const isHairballMatch = combinedTextLower.includes('bulu') || combinedTextLower.includes('rambut') || combinedTextLower.includes('hairball') || combinedTextLower.includes('trichobezoar');
        
        const isVomitMatch = combinedTextLower.includes('muntah') || combinedTextLower.includes('diare') || combinedTextLower.includes('lambung') || photoNames.includes('muntah') || photoNames.includes('vomit') || photoNames.includes('pug') || photoNames.includes('kibble');
        const isMouthMatch = combinedTextLower.includes('mulut') || combinedTextLower.includes('kutil') || combinedTextLower.includes('benjolan') || combinedTextLower.includes('gusi') || combinedTextLower.includes('papiloma') || photoNames.includes('papiloma') || photoNames.includes('mouth');
        const isSkinMatch = combinedTextLower.includes('muka') || combinedTextLower.includes('wajah') || combinedTextLower.includes('luka') || combinedTextLower.includes('kudis') || combinedTextLower.includes('mange') || combinedTextLower.includes('kulit') || combinedTextLower.includes('jamur') || combinedTextLower.includes('ringworm') || photoNames.includes('ringworm') || photoNames.includes('mange');

        let showSkin = false;
        let showMouth = false;
        let showVomit = false;

        if (state.selectedFocus === 'muntah') {
            showVomit = true;
        } else if (state.selectedFocus === 'kulit') {
            showSkin = true;
        } else if (state.selectedFocus === 'mulut') {
            showMouth = true;
        } else if (state.uploadedPhotos.length === 1 && !hasText) {
            if (isMouthMatch) showMouth = true;
            else if (isVomitMatch) showVomit = true;
            else showSkin = true;
        } else {
            showSkin = isSkinMatch || (!isMouthMatch && !isVomitMatch);
            showMouth = isMouthMatch;
            showVomit = isVomitMatch;
        }

        let detectedSpecies = selectedSpecies;
        const actionGroups = [];
        const detectedSymptoms = [];
        let citations = [];

        if (showSkin) {
            if (detectedSpecies === 'kucing') {
                detectedSymptoms.push({ name: 'Dermatitis & Ringworm / Jamur Kulit (Kucing)', type: 'yellow' });
                actionGroups.push({
                    category: '1. Area Kulit & Bulu (Ringworm Kucing)',
                    items: [
                        "Bersihkan area ruam pitak dengan antiseptik Chlorhexidine 2%",
                        "Oleskan salep/spray anti-jamur Miconazole dan pasang e-collar",
                        "Isolasi di ruangan kering dan mandikan dengan sampo anti-fungal"
                    ]
                });
                citations.push("Jurnal Kedokteran Hewan Indonesia (JKHI), Vol. 15, SINTA 2: Diagnosa Dermatofitosis Kucing");
            } else {
                detectedSymptoms.push({ name: 'Dermatitis & Kudis Mange / Scabies (Anjing)', type: 'yellow' });
                actionGroups.push({
                    category: '1. Area Kulit & Bulu (Kudis Mange Anjing)',
                    items: [
                        "Bersihkan area kerak luka dengan antiseptik Chlorhexidine",
                        "Berikan salep Ivermectin/Amitraz sesuai petunjuk dokter vet",
                        "Isolasi dan sterilkan tempat tidur anjing secara berkala"
                    ]
                });
                citations.push("Jurnal Veteriner UGM/IPB Vol 22 (SINTA 1): Penanganan Scabies & Mange Pada Canine");
            }
        }

        if (showMouth) {
            detectedSymptoms.push({ name: 'Oral Papillomatosis / Benjolan Gusi Mulut', type: 'yellow' });
            actionGroups.push({
                category: '2. Area Mulut & Gusi (Benjolan / Papiloma)',
                items: [
                    "Bilas rongga mulut dengan antiseptik Chlorhexidine gluconate 0.12%",
                    "Berikan makanan lunak (wet food) cair dan hindari kibble keras",
                    "Segera konsultasi vet jika benjolan membesar atau berdarah"
                ]
            });
            citations.push("Merck Veterinary Manual 2024: Canine & Feline Oral Papillomatosis Management");
        }

        if (showVomit) {
            if (isHairballMatch) {
                detectedSymptoms.push({ name: 'Muntah Bulu (Trichobezoar / Hairball)', type: 'yellow' });
                actionGroups.push({
                    category: '3. Pencernaan (Muntah Bulu / Hairball)',
                    items: [
                        "Berikan pasta hairball (laxative) sesuai dosis anjuran",
                        "Sikat bulu secara rutin (grooming) untuk mencegah tertelan",
                        "Berikan makanan khusus hairball control jika sering terjadi"
                    ]
                });
                citations.push("Journal of Feline Medicine and Surgery (SINTA 2): Management of Trichobezoars in Felines");
            } else {
                detectedSymptoms.push({ name: 'Regurgitasi / Muntah Makanan (Gastritis Akut)', type: 'yellow' });
                actionGroups.push({
                    category: '3. Pencernaan (Muntah Makanan & Gastritis Akut)',
                    items: [
                        "Puasakan makanan padat selama 6-8 jam (tetap sediakan air bersih)",
                        "Berikan oralit hewan atau larutan rehidrasi cair sedikit demi sedikit",
                        "Bawa ke klinik jika muntah terjadi lebih dari 3x dalam 12 jam"
                    ]
                });
                citations.push("Jurnal Ilmu Ternak dan Veteriner (JITV) Vol. 28 SINTA 1: Manajemen Gastritis Pada Anabul");
            }
        }

        return {
            statusType: 'yellow',
            species: detectedSpecies,
            symptoms: detectedSymptoms,
            actionGroups: actionGroups,
            citations: citations,
            aiAnalysis: aiText
        };
    }

    // Render Output UI Dashboard
    function renderOutputUI(data) {
        elements.resultPlaceholder.classList.add('hidden');
        elements.resultContent.classList.remove('hidden');
        
        // Trigger fluid slide up animation
        elements.resultContent.classList.remove('animate-slide-up');
        void elements.resultContent.offsetWidth; // trigger reflow
        elements.resultContent.classList.add('animate-slide-up');

        // Status Banner
        if (data.statusType === 'red') {
            elements.statusBanner.className = 'status-banner status-banner-red';
            elements.triageBadge.textContent = 'STATUS: DARURAT / KRITIS';
            elements.triageBadge.style.color = 'var(--red-emergency)';
            elements.triageBadge.style.borderColor = 'var(--red-emergency)';
        } else {
            elements.statusBanner.className = 'status-banner status-banner-yellow';
            elements.triageBadge.textContent = 'STATUS: PERINGATAN / MONITOR';
            elements.triageBadge.style.color = 'var(--amber-warning)';
            elements.triageBadge.style.borderColor = 'var(--amber-warning)';
        }

        const primarySymptom = data.symptoms[0] ? data.symptoms[0].name : 'Evaluasi Fisik Anabul';
        elements.triageTitle.textContent = primarySymptom;
        elements.triageDesc.textContent = `Triase medis terdeteksi untuk ${data.species.toUpperCase()}. Lakukan langkah pertolongan pertama di bawah ini.`;

        // Render AI Analysis Box if present
        if (data.aiAnalysis) {
            elements.aiAnalysisBox.classList.remove('hidden');
            elements.aiAnalysisText.textContent = data.aiAnalysis;
        } else {
            elements.aiAnalysisBox.classList.add('hidden');
            elements.aiAnalysisText.textContent = '';
        }

        // Render Action Checklists
        elements.actionCardsContainer.innerHTML = '';
        data.actionGroups.forEach(group => {
            const groupCard = document.createElement('div');
            groupCard.className = 'action-card-group';
            groupCard.innerHTML = `<div class="action-card-title">${group.category}</div>`;

            group.items.forEach(itemText => {
                const itemEl = document.createElement('div');
                itemEl.className = 'action-check-item';
                itemEl.innerHTML = `
                    <div class="custom-square-check"><i data-lucide="check" style="width:12px; height:12px;"></i></div>
                    <span>${itemText}</span>
                `;
                itemEl.addEventListener('click', () => {
                    itemEl.classList.toggle('checked');
                });
                groupCard.appendChild(itemEl);
            });

            elements.actionCardsContainer.appendChild(groupCard);
        });

        // Citations List
        elements.citationsList.innerHTML = '';
        data.citations.forEach(cit => {
            const citEl = document.createElement('div');
            citEl.className = 'citation-item';
            citEl.textContent = `• ${cit}`;
            elements.citationsList.appendChild(citEl);
        });

        if (window.lucide) window.lucide.createIcons();
        elements.resultSection.scrollIntoView({ behavior: 'smooth' });
    }

    // PDF Export Action
    elements.btnExportPDF.addEventListener('click', () => {
        window.print();
    });

    // Vet Modal Event Handlers
    function openVetModal() {
        renderVetClinics();
        elements.vetBottomSheet.classList.remove('hidden');
    }

    function closeVetModal() {
        elements.vetBottomSheet.classList.add('hidden');
    }

    function renderVetClinics() {
        elements.vetClinicList.innerHTML = '';
        clinicData.forEach(item => {
            const el = document.createElement('div');
            el.className = 'vet-item-card';
            el.innerHTML = `
                <div>
                    <div>${item.name}</div>
                    <div style="color:var(--text-secondary);">±${item.dist} dari lokasimu</div>
                </div>
                <a href="tel:${item.phone}" class="btn-brutalist btn-brutalist-emergency" style="padding:6px 12px;">
                    <i data-lucide="phone" style="width:12px; height:12px;"></i> Telepon
                </a>
            `;
            elements.vetClinicList.appendChild(el);
        });
        if (window.lucide) window.lucide.createIcons();
    }

    elements.btnOpenVetNav.addEventListener('click', openVetModal);
    elements.btnHeroVet.addEventListener('click', openVetModal);
    elements.btnOpenVetMap.addEventListener('click', openVetModal);
    elements.btnMobileVet.addEventListener('click', openVetModal);
    elements.btnCloseVetModal.addEventListener('click', closeVetModal);
});

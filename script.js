
        const SUPABASE_URL = "https://yzevnshvlqoywwqaspeu.supabase.co";
        const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6ZXZuc2h2bHFveXd3cWFzcGV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyNjU1NzMsImV4cCI6MjA4OTg0MTU3M30.u1vcHCu4TO9QDovs8TFNsMd5VewJVeSpavSUpEczqeY";
        const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

        let usuarioId = null;

        // ═══════════════════════════════════════════
        // TOAST SYSTEM
        // ═══════════════════════════════════════════

        function showToast(message, type = 'success') {
            const container = document.getElementById('toast-container');
            const toast = document.createElement('div');

            const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle', warning: 'fa-exclamation-triangle' };
            const colors = {
                success: 'bg-[#1c2434] border-green-500/40 text-green-400',
                error:   'bg-[#1c2434] border-red-500/40 text-red-400',
                info:    'bg-[#1c2434] border-blue-500/40 text-blue-400',
                warning: 'bg-[#1c2434] border-amber-500/40 text-amber-400',
            };

            toast.className = `pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl text-sm font-medium min-w-[240px] max-w-xs toast-in ${colors[type]}`;
            toast.innerHTML = `<i class="fas ${icons[type]} shrink-0"></i><span class="text-slate-200 font-normal">${message}</span>`;

            container.appendChild(toast);

            setTimeout(() => {
                toast.classList.replace('toast-in', 'toast-out');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }

        // ═══════════════════════════════════════════
        // AUTH & SCREENS
        // ═══════════════════════════════════════════

        async function gerenciarTelas() {
            const { data: { session } } = await supabaseClient.auth.getSession();

            const loginDiv = document.getElementById('tela-login');
            const painelDiv = document.getElementById('painel-interno');

            if (session) {
                usuarioId = session.user.id;
                loginDiv.classList.add('hidden');
                painelDiv.classList.remove('hidden');

                const emailUser = document.getElementById('email-user');
                if (emailUser) emailUser.textContent = session.user.email;

                carregarDashboard();
                carregarDevedores();
                carregarVendas();
                carregarGastos();
            } else {
                loginDiv.classList.remove('hidden');
                painelDiv.classList.add('hidden');
            }
        }

        // ═══════════════════════════════════════════
        // TABS
        // ═══════════════════════════════════════════

        function abrirAba(nomeAba) {
            document.querySelectorAll('.aba-content').forEach(el => el.classList.add('hidden'));
            const target = document.getElementById('aba-' + nomeAba);
            if (target) target.classList.remove('hidden');

            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('tab-active');
                btn.classList.add('border-transparent', 'text-slate-400');
                btn.classList.remove('text-blue-400', 'text-white');
            });
            const activeTab = document.getElementById('tab-' + nomeAba);
            if (activeTab) {
                activeTab.classList.add('tab-active');
                activeTab.classList.remove('border-transparent', 'text-slate-400');
            }

            document.querySelectorAll('.mob-tab').forEach(btn => {
                btn.classList.remove('text-blue-400');
                btn.classList.add('text-slate-500');
            });
            const activeMob = document.getElementById('mob-' + nomeAba);
            if (activeMob) {
                activeMob.classList.add('text-blue-400');
                activeMob.classList.remove('text-slate-500');
            }
        }

        // ═══════════════════════════════════════════
        // AUTH FUNCTIONS
        // ═══════════════════════════════════════════

        async function login() {
            const email = document.getElementById('email').value.trim();
            const senha = document.getElementById('senha').value;

            if (!email || !senha) {
                showToast('Preencha e-mail e senha.', 'warning');
                return;
            }

            const btn = document.getElementById('btn-entrar');
            btn.disabled = true;
            btn.innerHTML = '<div class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>Entrando...';

            try {
                const { error } = await supabaseClient.auth.signInWithPassword({ email, password: senha });

                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-sign-in-alt mr-2"></i>Entrar';

                if (error) {
                    showToast('Ocorreu um erro: ' + error.message, 'error');
                } else {
                    gerenciarTelas();
                }
            } catch (err) {
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-sign-in-alt mr-2"></i>Entrar';
                showToast('Falha de conexão. Verifique a URL no Supabase.', 'error');
                console.error("Erro no login:", err);
            }
        }

        async function logout() {
            await supabaseClient.auth.signOut();
            document.getElementById('email').value = '';
            document.getElementById('senha').value = '';
            usuarioId = null;
            gerenciarTelas();
        }

        function abrirModalRegistro() {
            document.getElementById('modal-registro').classList.remove('hidden');
            document.getElementById('modal-registro').classList.add('flex');
        }

        function fecharModalRegistro() {
            document.getElementById('modal-registro').classList.add('hidden');
            document.getElementById('modal-registro').classList.remove('flex');
            document.getElementById('reg-email').value = '';
            document.getElementById('reg-senha').value = '';
        }

        async function executarRegistro() {
            const email = document.getElementById('reg-email').value.trim();
            const senha = document.getElementById('reg-senha').value;

            if (!email || !senha) {
                showToast('Preencha e-mail e senha.', 'warning');
                return;
            }

            if (senha.length < 6) {
                showToast('A senha deve ter pelo menos 6 caracteres.', 'warning');
                return;
            }

            const { error } = await supabaseClient.auth.signUp({ email, password: senha });

            if (error) {
                showToast('Erro ao criar conta: ' + error.message, 'error');
            } else {
                showToast('Conta criada! Faça login para acessar.', 'success');
                fecharModalRegistro();
            }
        }

        // ═══════════════════════════════════════════
        // DEVEDORES
        // ═══════════════════════════════════════════

        async function adicionarDevedor() {
            const nome  = document.getElementById('dev-nome').value.trim();
            const valor = parseFloat(document.getElementById('dev-valor').value);
            const data  = document.getElementById('dev-data').value;

            if (!nome || !valor || !data) {
                showToast('Preencha todos os campos.', 'warning');
                return;
            }

            const { error } = await supabaseClient
                .from('devedores')
                .insert([{ usuario_id: usuarioId, nome, valor, data_vencimento: data, status: 'Pendente' }]);

            if (error) {
                showToast('Erro ao adicionar devedor: ' + error.message, 'error');
            } else {
                showToast(`Devedor "${nome}" adicionado.`, 'success');
                document.getElementById('dev-nome').value  = '';
                document.getElementById('dev-valor').value = '';
                document.getElementById('dev-data').value  = '';
                carregarDevedores();
                carregarDashboard();
            }
        }

        async function carregarDevedores() {
            if (!usuarioId) return;

            const { data: devedores, error } = await supabaseClient
                .from('devedores')
                .select('*')
                .eq('usuario_id', usuarioId)
                .order('data_vencimento', { ascending: true });

            const lista = document.getElementById('lista-devedores');

            if (error) {
                lista.innerHTML = msgErro(error.message);
                return;
            }

            if (!devedores || devedores.length === 0) {
                lista.innerHTML = msgVazia('Nenhum devedor registrado.');
                return;
            }

            const hoje = new Date().toISOString().split('T')[0];

            lista.innerHTML = devedores.map(dev => {
                const venc = dev.data_vencimento;
                const atrasado = venc < hoje && dev.status === 'Pendente';
                const statusColor = atrasado ? 'text-red-400' : 'text-emerald-400';
                const borderColor = atrasado ? 'border-red-500/30' : 'border-[#2e3a4e]';
                return `
                <div class="bg-[#1c2434] border ${borderColor} rounded-xl px-5 py-3.5 flex items-center justify-between gap-3 card-lift"
                     data-devedor-id="${dev.id}" data-devedor-nome="${dev.nome}">
                  <div class="flex items-center gap-3 flex-1 min-w-0">
                    <div class="w-8 h-8 rounded-lg bg-teal-500/15 flex items-center justify-center shrink-0">
                      <i class="fas fa-user text-teal-400 text-xs"></i>
                    </div>
                    <div class="min-w-0">
                      <p class="font-semibold text-white text-sm truncate">${dev.nome}</p>
                      <p class="text-xs text-slate-500 mt-0.5">Venc: ${formatarData(venc)} · <span class="${statusColor} font-medium">${atrasado ? 'Atrasado' : dev.status}</span></p>
                    </div>
                  </div>
                  <div class="flex items-center gap-4 shrink-0">
                    <p class="font-bold text-teal-400 text-sm">R$ ${dev.valor.toFixed(2)}</p>
                    <button onclick="excluirDevedor('${dev.id}', '${dev.nome}')"
                      class="text-slate-600 hover:text-red-400 transition text-sm p-1.5 rounded-lg hover:bg-red-500/10">
                      <i class="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </div>`;
            }).join('');
        }

        function filtrarDevedores() {
            const termo = document.getElementById('filtro-devedores').value.toLowerCase();
            document.querySelectorAll('#lista-devedores > div').forEach(el => {
                const nome = (el.dataset.devedorNome || '').toLowerCase();
                el.style.display = nome.includes(termo) ? '' : 'none';
            });
        }

        async function excluirDevedor(id, nome) {
            if (!confirm(`Deletar o devedor "${nome}"?`)) return;
            const { error } = await supabaseClient.from('devedores').delete().eq('id', id).eq('usuario_id', usuarioId);
            if (error) {
                showToast('Erro ao deletar: ' + error.message, 'error');
            } else {
                showToast(`"${nome}" removido.`, 'success');
                carregarDevedores();
                carregarDashboard();
            }
        }

        // ═══════════════════════════════════════════
        // VENDAS
        // ═══════════════════════════════════════════

        async function adicionarVenda() {
            const descricao = document.getElementById('vend-descricao').value.trim();
            const valor     = parseFloat(document.getElementById('vend-valor').value);
            const data      = document.getElementById('vend-data').value;

            if (!descricao || !valor || !data) {
                showToast('Preencha todos os campos.', 'warning');
                return;
            }

            const { error } = await supabaseClient
                .from('vendas')
                .insert([{ usuario_id: usuarioId, descricao, valor, data }]);

            if (error) {
                showToast('Erro ao registrar venda: ' + error.message, 'error');
            } else {
                showToast('Venda registrada!', 'success');
                document.getElementById('vend-descricao').value = '';
                document.getElementById('vend-valor').value     = '';
                document.getElementById('vend-data').value      = '';
                carregarVendas();
                carregarDashboard();
            }
        }

        async function carregarVendas() {
            if (!usuarioId) return;

            const { data: vendas, error } = await supabaseClient
                .from('vendas')
                .select('*')
                .eq('usuario_id', usuarioId)
                .order('data', { ascending: false });

            const lista    = document.getElementById('lista-vendas');
            const totalDiv = document.getElementById('total-vend-hoje');

            if (error) {
                lista.innerHTML = msgErro(error.message);
                return;
            }

            const hoje      = new Date().toISOString().split('T')[0];
            const totalHoje = (vendas || []).filter(v => v.data === hoje).reduce((s, v) => s + v.valor, 0);
            totalDiv.textContent = `R$ ${totalHoje.toFixed(2)}`;

            if (!vendas || vendas.length === 0) {
                lista.innerHTML = msgVazia('Nenhuma venda registrada.');
                return;
            }

            lista.innerHTML = vendas.map(v => `
                <div class="bg-[#1c2434] border border-[#2e3a4e] rounded-xl px-5 py-3.5 flex items-center justify-between gap-3 card-lift"
                     data-venda-id="${v.id}" data-venda-descricao="${v.descricao}">
                  <div class="flex items-center gap-3 flex-1 min-w-0">
                    <div class="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center shrink-0">
                      <i class="fas fa-tag text-amber-400 text-xs"></i>
                    </div>
                    <div class="min-w-0">
                      <p class="font-semibold text-white text-sm truncate">${v.descricao}</p>
                      <p class="text-xs text-slate-500 mt-0.5">${formatarData(v.data)}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-4 shrink-0">
                    <p class="font-bold text-amber-400 text-sm">R$ ${v.valor.toFixed(2)}</p>
                    <button onclick="excluirVenda('${v.id}', '${v.descricao}')"
                      class="text-slate-600 hover:text-red-400 transition text-sm p-1.5 rounded-lg hover:bg-red-500/10">
                      <i class="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </div>`).join('');
        }

        async function excluirVenda(id, descricao) {
            if (!confirm(`Deletar a venda "${descricao}"?`)) return;
            const { error } = await supabaseClient.from('vendas').delete().eq('id', id).eq('usuario_id', usuarioId);
            if (error) {
                showToast('Erro ao deletar: ' + error.message, 'error');
            } else {
                showToast('Venda removida.', 'success');
                carregarVendas();
                carregarDashboard();
            }
        }

        // ═══════════════════════════════════════════
        // GASTOS
        // ═══════════════════════════════════════════

        async function adicionarGasto() {
            const descricao = document.getElementById('gast-descricao').value.trim();
            const valor     = parseFloat(document.getElementById('gast-valor').value);
            const data      = document.getElementById('gast-data').value;

            if (!descricao || !valor || !data) {
                showToast('Preencha todos os campos.', 'warning');
                return;
            }

            const { error } = await supabaseClient
                .from('gastos')
                .insert([{ usuario_id: usuarioId, descricao, valor, data }]);

            if (error) {
                showToast('Erro ao registrar gasto: ' + error.message, 'error');
            } else {
                showToast('Gasto registrado!', 'success');
                document.getElementById('gast-descricao').value = '';
                document.getElementById('gast-valor').value     = '';
                document.getElementById('gast-data').value      = '';
                carregarGastos();
                carregarDashboard();
            }
        }

        async function carregarGastos() {
            if (!usuarioId) return;

            const { data: gastos, error } = await supabaseClient
                .from('gastos')
                .select('*')
                .eq('usuario_id', usuarioId)
                .order('data', { ascending: false });

            const lista    = document.getElementById('lista-gastos');
            const totalDiv = document.getElementById('total-gast-hoje');

            if (error) {
                lista.innerHTML = msgErro(error.message);
                return;
            }

            const hoje      = new Date().toISOString().split('T')[0];
            const totalHoje = (gastos || []).filter(g => g.data === hoje).reduce((s, g) => s + g.valor, 0);
            totalDiv.textContent = `R$ ${totalHoje.toFixed(2)}`;

            if (!gastos || gastos.length === 0) {
                lista.innerHTML = msgVazia('Nenhum gasto registrado.');
                return;
            }

            lista.innerHTML = gastos.map(g => `
                <div class="bg-[#1c2434] border border-[#2e3a4e] rounded-xl px-5 py-3.5 flex items-center justify-between gap-3 card-lift"
                     data-gasto-id="${g.id}" data-gasto-descricao="${g.descricao}">
                  <div class="flex items-center gap-3 flex-1 min-w-0">
                    <div class="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center shrink-0">
                      <i class="fas fa-receipt text-violet-400 text-xs"></i>
                    </div>
                    <div class="min-w-0">
                      <p class="font-semibold text-white text-sm truncate">${g.descricao}</p>
                      <p class="text-xs text-slate-500 mt-0.5">${formatarData(g.data)}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-4 shrink-0">
                    <p class="font-bold text-violet-400 text-sm">-R$ ${g.valor.toFixed(2)}</p>
                    <button onclick="excluirGasto('${g.id}', '${g.descricao}')"
                      class="text-slate-600 hover:text-red-400 transition text-sm p-1.5 rounded-lg hover:bg-red-500/10">
                      <i class="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </div>`).join('');
        }

        async function excluirGasto(id, descricao) {
            if (!confirm(`Deletar o gasto "${descricao}"?`)) return;
            const { error } = await supabaseClient.from('gastos').delete().eq('id', id).eq('usuario_id', usuarioId);
            if (error) {
                showToast('Erro ao deletar: ' + error.message, 'error');
            } else {
                showToast('Gasto removido.', 'success');
                carregarGastos();
                carregarDashboard();
            }
        }

        // ═══════════════════════════════════════════
        // DASHBOARD
        // ═══════════════════════════════════════════

        async function carregarDashboard() {
            if (!usuarioId) return;

            const [vendasRes, devedoresRes, gastosRes] = await Promise.all([
                supabaseClient.from('vendas').select('valor').eq('usuario_id', usuarioId),
                supabaseClient.from('devedores').select('valor').eq('usuario_id', usuarioId),
                supabaseClient.from('gastos').select('valor').eq('usuario_id', usuarioId),
            ]);

            const totalVendas  = (vendasRes.data    || []).reduce((s, v) => s + v.valor, 0);
            const totalReceber = (devedoresRes.data  || []).reduce((s, d) => s + d.valor, 0);
            const totalGastos  = (gastosRes.data     || []).reduce((s, g) => s + g.valor, 0);

            document.getElementById('total-vendas').textContent  = `R$ ${totalVendas.toFixed(2)}`;
            document.getElementById('total-receber').textContent = `R$ ${totalReceber.toFixed(2)}`;
            document.getElementById('total-gastos').textContent  = `R$ ${totalGastos.toFixed(2)}`;
        }

        async function zerarDashboard() {
            if (!confirm('Tem certeza? Isso vai deletar TODOS os registros. Esta ação é irreversível!')) return;
            try {
                await supabaseClient.from('devedores').delete().eq('usuario_id', usuarioId);
                await supabaseClient.from('vendas').delete().eq('usuario_id', usuarioId);
                await supabaseClient.from('gastos').delete().eq('usuario_id', usuarioId);
                showToast('Dados zerados com sucesso.', 'info');
                carregarDevedores();
                carregarVendas();
                carregarGastos();
                carregarDashboard();
            } catch (e) {
                showToast('Erro ao zerar: ' + e.message, 'error');
            }
        }

        // ═══════════════════════════════════════════
        // RELATÓRIOS — VERSÃO PROFISSIONAL
        // ═══════════════════════════════════════════

        async function gerarRelatorioPDF(tipo) {
            const loading  = document.getElementById('relatorio-loading');
            const preview  = document.getElementById('preview-relatorio');
            const conteudo = document.getElementById('conteudo-relatorio');

            if (!usuarioId) { showToast('Usuário não identificado.', 'error'); return; }

            loading.classList.remove('hidden');
            preview.classList.add('hidden');

            try {
                const [devRes, vendRes, gastRes] = await Promise.all([
                    supabaseClient.from('devedores').select('*').eq('usuario_id', usuarioId).order('data_vencimento', { ascending: true }),
                    supabaseClient.from('vendas').select('*').eq('usuario_id', usuarioId).order('data', { ascending: false }),
                    supabaseClient.from('gastos').select('*').eq('usuario_id', usuarioId).order('data', { ascending: false }),
                ]);

                const devedores = devRes.data  || [];
                const vendas    = vendRes.data  || [];
                const gastos    = gastRes.data  || [];

                const totalVendas  = vendas.reduce((s, v) => s + v.valor, 0);
                const totalGastos  = gastos.reduce((s, g) => s + g.valor, 0);
                const totalReceber = devedores.reduce((s, d) => s + d.valor, 0);
                const lucro        = totalVendas - totalGastos;
                const hoje         = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
                const agora        = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                const tituloTipo   = { completo: 'Relatório Completo', devedores: 'Relatório de Devedores', vendas: 'Relatório de Vendas', gastos: 'Relatório de Gastos' };

                let html = `
                <div style="font-family:'Inter',Arial,sans-serif;color:#1e293b;line-height:1.5;">
                  <div style="display:flex;align-items:center;justify-content:space-between;padding-bottom:20px;border-bottom:2px solid #e2e8f0;margin-bottom:24px;">
                    <div>
                      <div style="display:flex;align-items:center;gap:10px;margin-bottom:4px;">
                        <div style="background:#3b82f6;width:28px;height:28px;border-radius:6px;display:flex;align-items:center;justify-content:center;">
                          <span style="color:white;font-size:14px;font-weight:900;">$</span>
                        </div>
                        <span style="font-size:20px;font-weight:800;color:#0f172a;letter-spacing:1px;">DinheiroPro</span>
                      </div>
                      <p style="font-size:11px;color:#64748b;margin:0;letter-spacing:0.5px;text-transform:uppercase;">${tituloTipo[tipo]}</p>
                    </div>
                    <div style="text-align:right;">
                      <p style="font-size:11px;color:#64748b;margin:0;">Gerado em</p>
                      <p style="font-size:13px;font-weight:600;color:#334155;margin:2px 0 0;">${hoje} às ${agora}</p>
                    </div>
                  </div>
                  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:28px;">
                    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:14px;">
                      <p style="font-size:10px;color:#16a34a;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 6px;">Total Vendas</p>
                      <p style="font-size:20px;font-weight:800;color:#15803d;margin:0;">R$ ${totalVendas.toFixed(2)}</p>
                    </div>
                    <div style="background:#fefce8;border:1px solid #fde68a;border-radius:10px;padding:14px;">
                      <p style="font-size:10px;color:#b45309;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 6px;">A Receber</p>
                      <p style="font-size:20px;font-weight:800;color:#92400e;margin:0;">R$ ${totalReceber.toFixed(2)}</p>
                    </div>
                    <div style="background:${lucro >= 0 ? '#f0fdf4' : '#fef2f2'};border:1px solid ${lucro >= 0 ? '#bbf7d0' : '#fecaca'};border-radius:10px;padding:14px;">
                      <p style="font-size:10px;color:${lucro >= 0 ? '#16a34a' : '#dc2626'};font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 6px;">${lucro >= 0 ? 'Lucro Líquido' : 'Prejuízo'}</p>
                      <p style="font-size:20px;font-weight:800;color:${lucro >= 0 ? '#15803d' : '#991b1b'};margin:0;">R$ ${Math.abs(lucro).toFixed(2)}</p>
                    </div>
                  </div>`;

                if (tipo === 'completo' || tipo === 'devedores') html += secaoDevedoresPDF(devedores, totalReceber);
                if (tipo === 'completo' || tipo === 'vendas')    html += secaoVendasPDF(vendas, totalVendas);
                if (tipo === 'completo' || tipo === 'gastos')    html += secaoGastosPDF(gastos, totalGastos);
                if (tipo === 'completo') html += secaoResumoPDF(totalVendas, totalGastos, totalReceber, lucro);

                html += `
                  <div style="border-top:1px solid #e2e8f0;padding-top:14px;margin-top:28px;display:flex;justify-content:space-between;align-items:center;">
                    <p style="font-size:10px;color:#94a3b8;margin:0;">Este documento é confidencial.</p>
                    <p style="font-size:10px;color:#94a3b8;margin:0;">DinheiroPro © ${new Date().getFullYear()}</p>
                  </div>
                </div>`;

                conteudo.innerHTML = html;

            } catch (e) {
                showToast('Erro ao gerar relatório: ' + e.message, 'error');
            } finally {
                loading.classList.add('hidden');
                preview.classList.remove('hidden');
                document.getElementById('preview-relatorio').scrollIntoView({ behavior: 'smooth' });
            }
        }

        function secaoDevedoresPDF(devedores, total) {
            const hoje = new Date().toISOString().split('T')[0];
            if (!devedores.length) return secaoVazia('Devedores', 'Nenhum devedor registrado.');
            return `
            <div style="margin-bottom:24px;">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
                <h2 style="font-size:13px;font-weight:700;color:#0f172a;margin:0;text-transform:uppercase;letter-spacing:0.5px;">Devedores</h2>
                <span style="font-size:12px;font-weight:600;color:#0891b2;">Total a receber: R$ ${total.toFixed(2)}</span>
              </div>
              <table style="width:100%;border-collapse:collapse;font-size:11.5px;">
                <thead>
                  <tr style="background:#f8fafc;">
                    <th style="padding:10px 12px;text-align:left;border-bottom:2px solid #e2e8f0;color:#475569;font-weight:600;font-size:10px;text-transform:uppercase;">Nome</th>
                    <th style="padding:10px 12px;text-align:right;border-bottom:2px solid #e2e8f0;color:#475569;font-weight:600;font-size:10px;text-transform:uppercase;">Valor</th>
                    <th style="padding:10px 12px;text-align:center;border-bottom:2px solid #e2e8f0;color:#475569;font-weight:600;font-size:10px;text-transform:uppercase;">Vencimento</th>
                    <th style="padding:10px 12px;text-align:center;border-bottom:2px solid #e2e8f0;color:#475569;font-weight:600;font-size:10px;text-transform:uppercase;">Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${devedores.map((d, i) => {
                    const atrasado = d.data_vencimento < hoje && d.status === 'Pendente';
                    return `<tr style="background:${i % 2 === 0 ? '#fff' : '#f8fafc'};">
                      <td style="padding:9px 12px;border-bottom:1px solid #f1f5f9;color:#1e293b;font-weight:500;">${d.nome}</td>
                      <td style="padding:9px 12px;border-bottom:1px solid #f1f5f9;text-align:right;color:#0891b2;font-weight:700;">R$ ${d.valor.toFixed(2)}</td>
                      <td style="padding:9px 12px;border-bottom:1px solid #f1f5f9;text-align:center;color:#64748b;">${formatarData(d.data_vencimento)}</td>
                      <td style="padding:9px 12px;border-bottom:1px solid #f1f5f9;text-align:center;">
                        <span style="background:${atrasado ? '#fee2e2' : '#dcfce7'};color:${atrasado ? '#dc2626' : '#16a34a'};padding:2px 8px;border-radius:20px;font-size:10px;font-weight:600;">
                          ${atrasado ? 'Atrasado' : d.status}
                        </span>
                      </td>
                    </tr>`;
                  }).join('')}
                </tbody>
              </table>
            </div>`;
        }

        function secaoVendasPDF(vendas, total) {
            if (!vendas.length) return secaoVazia('Vendas', 'Nenhuma venda registrada.');
            return `
            <div style="margin-bottom:24px;">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
                <h2 style="font-size:13px;font-weight:700;color:#0f172a;margin:0;text-transform:uppercase;letter-spacing:0.5px;">Vendas</h2>
                <span style="font-size:12px;font-weight:600;color:#d97706;">Total faturado: R$ ${total.toFixed(2)}</span>
              </div>
              <table style="width:100%;border-collapse:collapse;font-size:11.5px;">
                <thead>
                  <tr style="background:#f8fafc;">
                    <th style="padding:10px 12px;text-align:left;border-bottom:2px solid #e2e8f0;color:#475569;font-weight:600;font-size:10px;text-transform:uppercase;">Descrição</th>
                    <th style="padding:10px 12px;text-align:right;border-bottom:2px solid #e2e8f0;color:#475569;font-weight:600;font-size:10px;text-transform:uppercase;">Valor</th>
                    <th style="padding:10px 12px;text-align:center;border-bottom:2px solid #e2e8f0;color:#475569;font-weight:600;font-size:10px;text-transform:uppercase;">Data</th>
                  </tr>
                </thead>
                <tbody>
                  ${vendas.map((v, i) => `
                    <tr style="background:${i % 2 === 0 ? '#fff' : '#f8fafc'};">
                      <td style="padding:9px 12px;border-bottom:1px solid #f1f5f9;color:#1e293b;font-weight:500;">${v.descricao}</td>
                      <td style="padding:9px 12px;border-bottom:1px solid #f1f5f9;text-align:right;color:#d97706;font-weight:700;">R$ ${v.valor.toFixed(2)}</td>
                      <td style="padding:9px 12px;border-bottom:1px solid #f1f5f9;text-align:center;color:#64748b;">${formatarData(v.data)}</td>
                    </tr>`).join('')}
                </tbody>
              </table>
            </div>`;
        }

        function secaoGastosPDF(gastos, total) {
            if (!gastos.length) return secaoVazia('Gastos', 'Nenhum gasto registrado.');
            return `
            <div style="margin-bottom:24px;">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
                <h2 style="font-size:13px;font-weight:700;color:#0f172a;margin:0;text-transform:uppercase;letter-spacing:0.5px;">Gastos</h2>
                <span style="font-size:12px;font-weight:600;color:#7c3aed;">Total de despesas: R$ ${total.toFixed(2)}</span>
              </div>
              <table style="width:100%;border-collapse:collapse;font-size:11.5px;">
                <thead>
                  <tr style="background:#f8fafc;">
                    <th style="padding:10px 12px;text-align:left;border-bottom:2px solid #e2e8f0;color:#475569;font-weight:600;font-size:10px;text-transform:uppercase;">Descrição</th>
                    <th style="padding:10px 12px;text-align:right;border-bottom:2px solid #e2e8f0;color:#475569;font-weight:600;font-size:10px;text-transform:uppercase;">Valor</th>
                    <th style="padding:10px 12px;text-align:center;border-bottom:2px solid #e2e8f0;color:#475569;font-weight:600;font-size:10px;text-transform:uppercase;">Data</th>
                  </tr>
                </thead>
                <tbody>
                  ${gastos.map((g, i) => `
                    <tr style="background:${i % 2 === 0 ? '#fff' : '#f8fafc'};">
                      <td style="padding:9px 12px;border-bottom:1px solid #f1f5f9;color:#1e293b;font-weight:500;">${g.descricao}</td>
                      <td style="padding:9px 12px;border-bottom:1px solid #f1f5f9;text-align:right;color:#7c3aed;font-weight:700;">-R$ ${g.valor.toFixed(2)}</td>
                      <td style="padding:9px 12px;border-bottom:1px solid #f1f5f9;text-align:center;color:#64748b;">${formatarData(g.data)}</td>
                    </tr>`).join('')}
                </tbody>
              </table>
            </div>`;
        }

        function secaoResumoPDF(totalVendas, totalGastos, totalReceber, lucro) {
            return `
            <div style="background:#0f172a;border-radius:12px;padding:20px;margin-bottom:24px;">
              <h2 style="font-size:13px;font-weight:700;color:#60a5fa;margin:0 0 16px;text-transform:uppercase;letter-spacing:0.5px;">Resumo Executivo</h2>
              <table style="width:100%;border-collapse:collapse;">
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #1e293b;color:#94a3b8;font-size:12px;">Total de Vendas</td>
                  <td style="padding:10px 0;border-bottom:1px solid #1e293b;text-align:right;color:#fbbf24;font-weight:700;font-size:14px;">R$ ${totalVendas.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #1e293b;color:#94a3b8;font-size:12px;">Total de Gastos</td>
                  <td style="padding:10px 0;border-bottom:1px solid #1e293b;text-align:right;color:#a78bfa;font-weight:700;font-size:14px;">R$ ${totalGastos.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #1e293b;color:#94a3b8;font-size:12px;">Total a Receber</td>
                  <td style="padding:10px 0;border-bottom:1px solid #1e293b;text-align:right;color:#34d399;font-weight:700;font-size:14px;">R$ ${totalReceber.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding:12px 0 0;color:#e2e8f0;font-size:13px;font-weight:700;">${lucro >= 0 ? 'Lucro Líquido' : 'Prejuízo'}</td>
                  <td style="padding:12px 0 0;text-align:right;color:${lucro >= 0 ? '#4ade80' : '#f87171'};font-weight:800;font-size:18px;">R$ ${Math.abs(lucro).toFixed(2)}</td>
                </tr>
              </table>
            </div>`;
        }

        function secaoVazia(nome, msg) {
            return `<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px;margin-bottom:20px;text-align:center;">
                      <p style="font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;margin:0 0 4px;">${nome}</p>
                      <p style="font-size:12px;color:#cbd5e1;margin:0;">${msg}</p>
                    </div>`;
        }

        async function downloadRelatorioPDF() {
            const el = document.getElementById('conteudo-relatorio');
            if (!el || !el.innerHTML.trim()) { showToast('Gere um relatório primeiro.', 'warning'); return; }

            try {
                showToast('Preparando PDF...', 'info');
                const canvas = await html2canvas(el, {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: '#ffffff',
                    // Remove Tailwind v4 stylesheets (que usam oklch) antes de capturar.
                    // O conteúdo do relatório usa apenas inline styles, então o PDF fica intacto.
                    onclone: (clonedDoc) => {
                        clonedDoc.querySelectorAll('style, link[rel="stylesheet"]').forEach(s => s.remove());
                    }
                });
                const img    = canvas.toDataURL('image/png');
                const pdf    = new jspdf.jsPDF('p', 'mm', 'a4');
                const w      = 190;
                const h      = (canvas.height * w) / canvas.width;
                const pageH  = 277;

                pdf.addImage(img, 'PNG', 10, 10, w, Math.min(h, pageH));
                let pos = h + 10;
                while (pos > pageH) {
                    pdf.addPage();
                    pos -= pageH;
                    pdf.addImage(img, 'PNG', 10, 10 - pos, w, h);
                }

                const nome = `DinheiroPro_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`;
                pdf.save(nome);
                showToast('PDF baixado com sucesso!', 'success');
            } catch (e) {
                showToast('Erro ao gerar PDF: ' + e.message, 'error');
            }
        }

        // ═══════════════════════════════════════════
        // HELPERS
        // ═══════════════════════════════════════════

        function formatarData(iso) {
            if (!iso) return '—';
            const [y, m, d] = iso.split('-');
            return `${d}/${m}/${y}`;
        }

        function msgErro(msg) {
            return `<div class="text-center py-6 text-red-400 text-sm"><i class="fas fa-exclamation-circle mr-2"></i>${msg}</div>`;
        }

        function msgVazia(msg) {
            return `<div class="bg-[#1c2434] border border-dashed border-[#2e3a4e] rounded-xl px-5 py-10 text-center text-slate-500 text-sm">${msg}</div>`;
        }

        // ═══════════════════════════════════════════
        // INIT
        // ═══════════════════════════════════════════

        window.addEventListener('load', gerenciarTelas);
        supabaseClient.auth.onAuthStateChange(() => gerenciarTelas());
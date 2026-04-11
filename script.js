
        const SUPABASE_URL = "https://yzevnshvlqoywwqaspeu.supabase.co";
        const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6ZXZuc2h2bHFveXd3cWFzcGV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyNjU1NzMsImV4cCI6MjA4OTg0MTU3M30.u1vcHCu4TO9QDovs8TFNsMd5VewJVeSpavSUpEczqeY";
        const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

        let usuarioId = null;
        let _relatorioCache = null; // cache do último relatório gerado

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
        // RELATÓRIOS
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

                const devedores    = devRes.data   || [];
                const vendas       = vendRes.data   || [];
                const gastos       = gastRes.data   || [];
                const totalVendas  = vendas.reduce((s, v) => s + v.valor, 0);
                const totalGastos  = gastos.reduce((s, g) => s + g.valor, 0);
                const totalReceber = devedores.reduce((s, d) => s + d.valor, 0);
                const lucro        = totalVendas - totalGastos;
                const tituloTipo   = { completo: 'Relatório Completo', devedores: 'Relatório de Devedores', vendas: 'Relatório de Vendas', gastos: 'Relatório de Gastos' };

                // Salva cache para o download
                _relatorioCache = { tipo, devedores, vendas, gastos, totalVendas, totalGastos, totalReceber, lucro };

                // ── Preview responsivo dark-mode ──
                const lucroColorClass = lucro >= 0 ? 'text-emerald-400' : 'text-red-400';
                const lucroBgClass    = lucro >= 0 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30';

                const hoje = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
                const agora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

                let html = `
                <!-- Header do preview -->
                <div class="bg-[#1c2434] border border-[#2e3a4e] rounded-xl p-4 flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 bg-blue-500 rounded-lg flex items-center justify-center shrink-0"><i class="fas fa-dollar-sign text-white text-sm"></i></div>
                    <div>
                      <p class="font-bold text-white text-sm">DinheiroPro</p>
                      <p class="text-xs text-slate-500">${tituloTipo[tipo]}</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="text-xs text-slate-500">Gerado em</p>
                    <p class="text-xs font-semibold text-slate-300">${hoje} · ${agora}</p>
                  </div>
                </div>

                <!-- KPIs -->
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div class="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                    <p class="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">Total Vendas</p>
                    <p class="text-xl font-extrabold text-white">R$ ${totalVendas.toFixed(2)}</p>
                    <p class="text-xs text-slate-500 mt-1">${vendas.length} registro(s)</p>
                  </div>
                  <div class="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                    <p class="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">A Receber</p>
                    <p class="text-xl font-extrabold text-white">R$ ${totalReceber.toFixed(2)}</p>
                    <p class="text-xs text-slate-500 mt-1">${devedores.length} devedor(es)</p>
                  </div>
                  <div class="${lucroBgClass} border rounded-xl p-4">
                    <p class="text-xs font-bold ${lucroColorClass} uppercase tracking-wider mb-1">${lucro >= 0 ? 'Lucro Líquido' : 'Prejuízo'}</p>
                    <p class="text-xl font-extrabold text-white">R$ ${Math.abs(lucro).toFixed(2)}</p>
                    <p class="text-xs text-slate-500 mt-1">Vendas - Gastos</p>
                  </div>
                </div>`;

                const tabelaPreview = (titulo, iconClass, iconColor, colunas, linhas) => {
                    if (!linhas.length) return `<div class="bg-[#1c2434] border border-dashed border-[#2e3a4e] rounded-xl p-5 text-center text-slate-600 text-xs">Sem registros em ${titulo}</div>`;
                    return `
                    <div class="bg-[#1c2434] border border-[#2e3a4e] rounded-xl overflow-hidden">
                      <div class="px-4 py-3 border-b border-[#2e3a4e] flex items-center gap-2">
                        <div class="w-6 h-6 rounded-md ${iconColor} flex items-center justify-center"><i class="fas ${iconClass} text-xs"></i></div>
                        <span class="text-xs font-bold text-white uppercase tracking-wider">${titulo}</span>
                      </div>
                      <div class="overflow-x-auto">
                        <table class="w-full text-xs">
                          <thead><tr class="bg-[#0f172a]">${colunas.map(c => `<th class="px-4 py-2.5 text-left text-slate-500 font-semibold uppercase tracking-wider">${c}</th>`).join('')}</tr></thead>
                          <tbody>${linhas}</tbody>
                        </table>
                      </div>
                    </div>`;
                };

                const hj = new Date().toISOString().split('T')[0];

                if (tipo === 'completo' || tipo === 'devedores') {
                    const linhas = devedores.map((d, i) => {
                        const atrasado = d.data_vencimento < hj && d.status === 'Pendente';
                        return `<tr class="border-b border-[#2e3a4e] ${i % 2 === 0 ? '' : 'bg-[#0f172a]/40'}">
                          <td class="px-4 py-2.5 text-slate-200 font-medium">${d.nome}</td>
                          <td class="px-4 py-2.5 text-teal-400 font-bold">R$ ${d.valor.toFixed(2)}</td>
                          <td class="px-4 py-2.5 text-slate-400">${formatarData(d.data_vencimento)}</td>
                          <td class="px-4 py-2.5"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${atrasado ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}">${atrasado ? 'Atrasado' : d.status}</span></td>
                        </tr>`;
                    }).join('');
                    html += tabelaPreview('Devedores', 'fa-user', 'bg-teal-500/20 text-teal-400', ['Nome', 'Valor', 'Vencimento', 'Status'], linhas);
                }

                if (tipo === 'completo' || tipo === 'vendas') {
                    const linhas = vendas.map((v, i) => `<tr class="border-b border-[#2e3a4e] ${i % 2 === 0 ? '' : 'bg-[#0f172a]/40'}">
                      <td class="px-4 py-2.5 text-slate-200 font-medium">${v.descricao}</td>
                      <td class="px-4 py-2.5 text-amber-400 font-bold">R$ ${v.valor.toFixed(2)}</td>
                      <td class="px-4 py-2.5 text-slate-400">${formatarData(v.data)}</td>
                    </tr>`).join('');
                    html += tabelaPreview('Vendas', 'fa-tag', 'bg-amber-500/20 text-amber-400', ['Descrição', 'Valor', 'Data'], linhas);
                }

                if (tipo === 'completo' || tipo === 'gastos') {
                    const linhas = gastos.map((g, i) => `<tr class="border-b border-[#2e3a4e] ${i % 2 === 0 ? '' : 'bg-[#0f172a]/40'}">
                      <td class="px-4 py-2.5 text-slate-200 font-medium">${g.descricao}</td>
                      <td class="px-4 py-2.5 text-violet-400 font-bold">-R$ ${g.valor.toFixed(2)}</td>
                      <td class="px-4 py-2.5 text-slate-400">${formatarData(g.data)}</td>
                    </tr>`).join('');
                    html += tabelaPreview('Gastos', 'fa-receipt', 'bg-violet-500/20 text-violet-400', ['Descrição', 'Valor', 'Data'], linhas);
                }

                if (tipo === 'completo') {
                    html += `
                    <div class="bg-[#0f172a] border border-[#1e293b] rounded-xl p-5">
                      <p class="text-xs font-bold text-blue-400 uppercase tracking-wider mb-4">Resumo Executivo</p>
                      <div class="space-y-2.5">
                        <div class="flex justify-between items-center py-2 border-b border-[#1e293b]"><span class="text-slate-400 text-xs">Total de Vendas</span><span class="font-bold text-amber-400 text-sm">R$ ${totalVendas.toFixed(2)}</span></div>
                        <div class="flex justify-between items-center py-2 border-b border-[#1e293b]"><span class="text-slate-400 text-xs">Total de Gastos</span><span class="font-bold text-violet-400 text-sm">R$ ${totalGastos.toFixed(2)}</span></div>
                        <div class="flex justify-between items-center py-2 border-b border-[#1e293b]"><span class="text-slate-400 text-xs">Total a Receber</span><span class="font-bold text-teal-400 text-sm">R$ ${totalReceber.toFixed(2)}</span></div>
                        <div class="flex justify-between items-center pt-2"><span class="text-white font-bold text-sm">${lucro >= 0 ? 'Lucro Líquido' : 'Prejuízo'}</span><span class="font-extrabold text-xl ${lucroColorClass}">R$ ${Math.abs(lucro).toFixed(2)}</span></div>
                      </div>
                    </div>`;
                }

                conteudo.innerHTML = html;

            } catch (e) {
                showToast('Erro ao gerar relatório: ' + e.message, 'error');
                console.error(e);
            } finally {
                loading.classList.add('hidden');
                preview.classList.remove('hidden');
                document.getElementById('preview-relatorio').scrollIntoView({ behavior: 'smooth' });
            }
        }

        async function downloadRelatorioPDF() {
            if (!_relatorioCache) { showToast('Gere um relatório primeiro.', 'warning'); return; }

            const { tipo, devedores, vendas, gastos, totalVendas, totalGastos, totalReceber, lucro } = _relatorioCache;
            const tituloTipo = { completo: 'Relatório Completo', devedores: 'Relatório de Devedores', vendas: 'Relatório de Vendas', gastos: 'Relatório de Gastos' };
            const hoje  = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
            const agora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            const hj    = new Date().toISOString().split('T')[0];

            showToast('Gerando PDF vetorial...', 'info');

            try {
                const pdf = new jspdf.jsPDF('p', 'mm', 'a4');
                const W = 210, H = 297, ml = 14, mr = 14, uw = W - ml - mr;

                // ─── FUNÇÃO: desenha cabeçalho em cada página ───
                const desenharCabecalho = () => {
                    // Barra azul
                    pdf.setFillColor(37, 99, 235);
                    pdf.rect(0, 0, W, 17, 'F');
                    // Faixa accent
                    pdf.setFillColor(96, 165, 250);
                    pdf.rect(0, 15, W, 2, 'F');
                    // Ícone $
                    pdf.setFillColor(255, 255, 255);
                    pdf.roundedRect(ml, 3.5, 10, 10, 1.5, 1.5, 'F');
                    pdf.setTextColor(37, 99, 235);
                    pdf.setFontSize(9); pdf.setFont('helvetica', 'bold');
                    pdf.text('$', ml + 5, 11, { align: 'center' });
                    // Nome
                    pdf.setTextColor(255, 255, 255);
                    pdf.setFontSize(13); pdf.setFont('helvetica', 'bold');
                    pdf.text('DINHEIRO', ml + 13, 11);
                    pdf.setTextColor(147, 197, 253);
                    pdf.text('PRO', ml + 41.5, 11);
                    // Tipo do relatório
                    pdf.setTextColor(255, 255, 255);
                    pdf.setFontSize(6.5); pdf.setFont('helvetica', 'normal');
                    pdf.text(tituloTipo[tipo].toUpperCase(), W - mr, 10, { align: 'right' });
                };
                desenharCabecalho();

                let y = 23;

                // ─── Linha de meta ───
                pdf.setTextColor(100, 116, 139); pdf.setFontSize(7); pdf.setFont('helvetica', 'normal');
                pdf.text(`Gerado em ${hoje} às ${agora}  •  Documento Confidencial`, ml, y);
                y += 9;

                // ─── KPI CARDS ───
                const cardW = (uw - 8) / 3;
                const cards = [
                    { label: 'TOTAL VENDAS',   value: `R$ ${totalVendas.toFixed(2)}`,  sub: `${vendas.length} registros`,   bg: [240,253,244], bd: [34,197,94],  lc: [22,163,74],  vc: [21,128,61]  },
                    { label: 'A RECEBER',       value: `R$ ${totalReceber.toFixed(2)}`, sub: `${devedores.length} devedores`, bg: [254,252,232], bd: [234,179,8], lc: [180,83,9],   vc: [146,64,14]  },
                    { label: lucro>=0?'LUCRO':'PREJUÍZO', value: `R$ ${Math.abs(lucro).toFixed(2)}`, sub: lucro>=0?'Resultado positivo':'Resultado negativo',
                      bg: lucro>=0?[240,253,244]:[254,242,242], bd: lucro>=0?[34,197,94]:[239,68,68], lc: lucro>=0?[22,163,74]:[220,38,38], vc: lucro>=0?[21,128,61]:[153,27,27] },
                ];
                cards.forEach((c, i) => {
                    const cx = ml + i * (cardW + 4);
                    pdf.setFillColor(...c.bg); pdf.roundedRect(cx, y, cardW, 26, 2, 2, 'F');
                    pdf.setFillColor(...c.bd); pdf.roundedRect(cx, y, 2.5, 26, 1, 1, 'F');
                    pdf.setDrawColor(...c.bd); pdf.setLineWidth(0.3); pdf.roundedRect(cx, y, cardW, 26, 2, 2, 'S');
                    pdf.setTextColor(...c.lc); pdf.setFontSize(6); pdf.setFont('helvetica', 'bold');
                    pdf.text(c.label, cx + 5.5, y + 7);
                    pdf.setTextColor(...c.vc); pdf.setFontSize(11); pdf.setFont('helvetica', 'bold');
                    pdf.text(c.value, cx + 5.5, y + 17);
                    pdf.setTextColor(100,116,139); pdf.setFontSize(6); pdf.setFont('helvetica', 'normal');
                    pdf.text(c.sub, cx + 5.5, y + 23);
                });
                y += 34;

                // ─── Linha separadora ───
                pdf.setDrawColor(226, 232, 240); pdf.setLineWidth(0.25);
                pdf.line(ml, y - 4, W - mr, y - 4);

                // ─── CONFIG SHARED das tabelas ───
                const tableBase = {
                    theme: 'plain',
                    styles: { fontSize: 8, cellPadding: { top: 3.5, right: 4, bottom: 3.5, left: 4 }, lineColor: [241,245,249], lineWidth: 0.2, font: 'helvetica', textColor: [30,41,59] },
                    headStyles: { fillColor: [15,23,42], textColor: [148,163,184], fontSize: 6.5, fontStyle: 'bold', cellPadding: { top: 4, right: 4, bottom: 4, left: 4 } },
                    alternateRowStyles: { fillColor: [248,250,252] },
                    bodyStyles: { fillColor: [255,255,255] },
                    margin: { left: ml, right: mr },
                    didDrawPage: () => { desenharCabecalho(); },
                };

                const sectionLabel = (label) => {
                    pdf.setFillColor(248,250,252); pdf.rect(ml, y, uw, 9, 'F');
                    pdf.setDrawColor(226,232,240); pdf.setLineWidth(0.2); pdf.rect(ml, y, uw, 9, 'S');
                    pdf.setDrawColor(59,130,246); pdf.setLineWidth(1.5); pdf.line(ml, y, ml, y + 9);
                    pdf.setTextColor(15,23,42); pdf.setFontSize(8); pdf.setFont('helvetica', 'bold');
                    pdf.text(label, ml + 5, y + 6);
                    y += 9;
                };

                // ─── DEVEDORES ───
                if ((tipo === 'completo' || tipo === 'devedores') && devedores.length) {
                    sectionLabel('DEVEDORES');
                    pdf.autoTable({
                        startY: y,
                        head: [['NOME', 'VALOR', 'VENCIMENTO', 'STATUS']],
                        body: devedores.map(d => {
                            const at = d.data_vencimento < hj && d.status === 'Pendente';
                            return [d.nome, `R$ ${d.valor.toFixed(2)}`, formatarData(d.data_vencimento), at ? 'Atrasado' : d.status];
                        }),
                        columnStyles: { 0:{cellWidth:76}, 1:{cellWidth:36,halign:'right',textColor:[8,145,178],fontStyle:'bold'}, 2:{cellWidth:34,halign:'center'}, 3:{cellWidth:34,halign:'center'} },
                        didParseCell: data => {
                            if (data.column.index === 3 && data.section === 'body') {
                                data.cell.styles.textColor = data.cell.raw === 'Atrasado' ? [220,38,38] : [22,163,74];
                                data.cell.styles.fontStyle = 'bold';
                            }
                        },
                        ...tableBase,
                    });
                    y = pdf.lastAutoTable.finalY + 8;
                }

                // ─── VENDAS ───
                if ((tipo === 'completo' || tipo === 'vendas') && vendas.length) {
                    sectionLabel('VENDAS');
                    pdf.autoTable({
                        startY: y,
                        head: [['DESCRIÇÃO', 'VALOR', 'DATA']],
                        body: vendas.map(v => [v.descricao, `R$ ${v.valor.toFixed(2)}`, formatarData(v.data)]),
                        columnStyles: { 0:{cellWidth:110}, 1:{cellWidth:36,halign:'right',textColor:[217,119,6],fontStyle:'bold'}, 2:{cellWidth:34,halign:'center'} },
                        ...tableBase,
                    });
                    y = pdf.lastAutoTable.finalY + 8;
                }

                // ─── GASTOS ───
                if ((tipo === 'completo' || tipo === 'gastos') && gastos.length) {
                    sectionLabel('GASTOS');
                    pdf.autoTable({
                        startY: y,
                        head: [['DESCRIÇÃO', 'VALOR', 'DATA']],
                        body: gastos.map(g => [g.descricao, `-R$ ${g.valor.toFixed(2)}`, formatarData(g.data)]),
                        columnStyles: { 0:{cellWidth:110}, 1:{cellWidth:36,halign:'right',textColor:[124,58,237],fontStyle:'bold'}, 2:{cellWidth:34,halign:'center'} },
                        ...tableBase,
                    });
                    y = pdf.lastAutoTable.finalY + 8;
                }

                // ─── RESUMO EXECUTIVO (apenas completo) ───
                if (tipo === 'completo') {
                    const rh = 54;
                    // Verifica se cabe na página, senão passa para próxima
                    if (y + rh > H - 20) { pdf.addPage(); desenharCabecalho(); y = 25; }

                    pdf.setFillColor(15, 23, 42); pdf.roundedRect(ml, y, uw, rh, 3, 3, 'F');
                    pdf.setDrawColor(30,41,59); pdf.setLineWidth(0.2); pdf.roundedRect(ml, y, uw, rh, 3, 3, 'S');

                    pdf.setTextColor(96,165,250); pdf.setFontSize(7.5); pdf.setFont('helvetica', 'bold');
                    pdf.text('RESUMO EXECUTIVO', ml + 6, y + 8);
                    pdf.setDrawColor(30,41,59); pdf.setLineWidth(0.2); pdf.line(ml+6, y+11, W-mr-6, y+11);

                    const resumoLinhas = [
                        ['Total de Vendas',   `R$ ${totalVendas.toFixed(2)}`,   [251,191,36]],
                        ['Total de Gastos',   `R$ ${totalGastos.toFixed(2)}`,   [167,139,250]],
                        ['Total a Receber',   `R$ ${totalReceber.toFixed(2)}`,   [52,211,153]],
                    ];
                    resumoLinhas.forEach(([label, value, color], i) => {
                        const ry = y + 20 + i * 9;
                        pdf.setTextColor(148,163,184); pdf.setFontSize(7.5); pdf.setFont('helvetica', 'normal');
                        pdf.text(label, ml + 6, ry);
                        pdf.setTextColor(...color); pdf.setFont('helvetica', 'bold');
                        pdf.text(value, W - mr - 6, ry, { align: 'right' });
                    });

                    pdf.setDrawColor(30,41,59); pdf.line(ml+6, y+43, W-mr-6, y+43);
                    pdf.setTextColor(226,232,240); pdf.setFontSize(9); pdf.setFont('helvetica', 'bold');
                    pdf.text(lucro >= 0 ? 'Lucro Liquido' : 'Prejuizo', ml + 6, y + 51);
                    pdf.setTextColor(...(lucro >= 0 ? [74,222,128] : [248,113,113]));
                    pdf.setFontSize(13); pdf.text(`R$ ${Math.abs(lucro).toFixed(2)}`, W - mr - 6, y + 51, { align: 'right' });
                }

                // ─── FOOTER em todas as páginas ───
                const totalPgs = pdf.internal.getNumberOfPages();
                for (let pg = 1; pg <= totalPgs; pg++) {
                    pdf.setPage(pg);
                    pdf.setFillColor(248,250,252); pdf.rect(0, H - 10, W, 10, 'F');
                    pdf.setDrawColor(226,232,240); pdf.setLineWidth(0.2); pdf.line(0, H-10, W, H-10);
                    pdf.setTextColor(148,163,184); pdf.setFontSize(6.5); pdf.setFont('helvetica', 'normal');
                    pdf.text('DinheiroPro  —  Documento Confidencial', ml, H - 4);
                    pdf.text(`Pag. ${pg} / ${totalPgs}  •  ${hoje}`, W - mr, H - 4, { align: 'right' });
                }

                const nome = `DinheiroPro_${tipo}_${hoje.replace(/\//g, '-')}.pdf`;
                pdf.save(nome);
                showToast('PDF baixado com sucesso!', 'success');

            } catch (e) {
                showToast('Erro ao gerar PDF: ' + e.message, 'error');
                console.error(e);
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
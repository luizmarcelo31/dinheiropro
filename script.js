
        const SUPABASE_URL = "https://yzevnshvlqoywwqaspeu.supabase.co";
        const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6ZXZuc2h2bHFveXd3cWFzcGV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyNjU1NzMsImV4cCI6MjA4OTg0MTU3M30.u1vcHCu4TO9QDovs8TFNsMd5VewJVeSpavSUpEczqeY";
        const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

        let usuarioId = null;

        async function gerenciarTelas() {
            const { data: { session } } = await supabaseClient.auth.getSession();
            
            const loginDiv = document.getElementById("tela-login");
            const painelDiv = document.getElementById("painel-interno");

            if (session) {
                usuarioId = session.user.id;
                if(loginDiv) loginDiv.style.display = "none";
                if(painelDiv) painelDiv.style.display = "block";
                
                const emailUser = document.getElementById("email-user");
                if(emailUser) emailUser.textContent = session.user.email;
                
                console.log("Logado como:", session.user.email);
                
                carregarDashboard();
                carregarDevedores();
                carregarVendas();
                carregarGastos();
            } else {
                if(loginDiv) loginDiv.style.display = "block";
                if(painelDiv) painelDiv.style.display = "none";
            }
        }

        function abrirAba(nomeAba) {
            const abas = document.querySelectorAll('.aba-content');
            abas.forEach(aba => aba.style.display = 'none');

            const abaAtiva = document.getElementById('aba-' + nomeAba);
            if(abaAtiva) abaAtiva.style.display = 'block';

            const botoes = document.querySelectorAll('.tab-btn');
            botoes.forEach(botao => botao.classList.remove('active'));

            if(event && event.currentTarget) {
                event.currentTarget.classList.add('active');
            }
        }

        async function login() {
            const email = document.getElementById("email").value;
            const senha = document.getElementById("senha").value;

            if (!email || !senha) {
                alert("Por favor, preencha email e senha");
                return;
            }

            const { error } = await supabaseClient.auth.signInWithPassword({ email, password: senha });

            if (error) {
                alert("Erro: " + error.message);
            } else {
                gerenciarTelas();
            }
        }

        async function logout() {
            await supabaseClient.auth.signOut();
            document.getElementById("email").value = "";
            document.getElementById("senha").value = "";
            usuarioId = null;
            gerenciarTelas();
        }

        function abrirModalRegistro() {
            document.getElementById("modal-registro").style.display = "flex";
        }

        function fecharModalRegistro() {
            document.getElementById("modal-registro").style.display = "none";
            document.getElementById("reg-email").value = "";
            document.getElementById("reg-senha").value = "";
        }

        async function executarRegistro() {
            const email = document.getElementById("reg-email").value;
            const senha = document.getElementById("reg-senha").value;

            if (!email || !senha) {
                alert("Por favor, preencha email e senha");
                return;
            }

            if (senha.length < 6) {
                alert("A senha deve ter pelo menos 6 caracteres");
                return;
            }

            const { error } = await supabaseClient.auth.signUp({ email, password: senha });

            if (error) {
                alert("Erro ao criar conta: " + error.message);
            } else {
                alert("Conta criada com sucesso! Faça login para acessar.");
                fecharModalRegistro();
            }
        }

        async function adicionarDevedor() {
            const nome = document.getElementById("dev-nome").value;
            const valor = parseFloat(document.getElementById("dev-valor").value);
            const data = document.getElementById("dev-data").value;

            if (!nome || !valor || !data) {
                alert("Preencha todos os campos");
                return;
            }

            const { error } = await supabaseClient
                .from('devedores')
                .insert([{ usuario_id: usuarioId, nome, valor, data_vencimento: data, status: 'Pendente' }]);

            if (error) {
                alert("Erro ao adicionar devedor: " + error.message);
            } else {
                alert("Devedor adicionado com sucesso!");
                document.getElementById("dev-nome").value = "";
                document.getElementById("dev-valor").value = "";
                document.getElementById("dev-data").value = "";
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

            const listaDiv = document.getElementById("lista-devedores");

            if (error) {
                listaDiv.innerHTML = `<p style="color: #ef4444;">Erro ao carregar: ${error.message}</p>`;
            } else if (!devedores || devedores.length === 0) {
                listaDiv.innerHTML = `<p style="color: #94a3b8; text-align: center;">Nenhum devedor registrado.</p>`;
            } else {
                listaDiv.innerHTML = devedores.map(dev => `
                    <div class="devedor-item" data-devedor-id="${dev.id}" data-devedor-nome="${dev.nome}">
                        <div class="devedor-info">
                            <p class="devedor-nome">${dev.nome}</p>
                            <p class="devedor-valor">R$ ${dev.valor.toFixed(2)}</p>
                            <p class="devedor-data">Vencimento: ${new Date(dev.data_vencimento).toLocaleDateString('pt-BR')}</p>
                            <p class="devedor-status">Status: ${dev.status}</p>
                        </div>
                        <div class="devedor-acoes">
                            <button class="btn-deletar" onclick="excluirDevedor('${dev.id}', '${dev.nome}')">
                                <i class="fas fa-trash"></i> DELETAR
                            </button>
                        </div>
                    </div>
                `).join('');
            }
        }

        async function adicionarVenda() {
            const descricao = document.getElementById("vend-descricao").value;
            const valor = parseFloat(document.getElementById("vend-valor").value);
            const data = document.getElementById("vend-data").value;

            if (!descricao || !valor || !data) {
                alert("Preencha todos os campos");
                return;
            }

            const { error } = await supabaseClient
                .from('vendas')
                .insert([{ usuario_id: usuarioId, descricao, valor, data }]);

            if (error) {
                alert("Erro ao registrar venda: " + error.message);
            } else {
                alert("Venda registrada com sucesso!");
                document.getElementById("vend-descricao").value = "";
                document.getElementById("vend-valor").value = "";
                document.getElementById("vend-data").value = "";
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

            const listaDiv = document.getElementById("lista-vendas");
            const totalDiv = document.getElementById("total-vend-hoje");

            if (error) {
                listaDiv.innerHTML = `<p style="color: #ef4444;">Erro ao carregar: ${error.message}</p>`;
            } else {
                const hoje = new Date().toISOString().split('T')[0];
                const totalHoje = vendas.filter(v => v.data === hoje).reduce((sum, v) => sum + v.valor, 0);
                totalDiv.textContent = `R$ ${totalHoje.toFixed(2)}`;

                if (!vendas || vendas.length === 0) {
                    listaDiv.innerHTML = `<p style="color: #94a3b8;">Nenhuma venda registrada.</p>`;
                } else {
                    listaDiv.innerHTML = vendas.map(venda => `
                        <div class="venda-item" data-venda-id="${venda.id}" data-venda-descricao="${venda.descricao}">
                            <div class="venda-info">
                                <p class="venda-descricao">${venda.descricao}</p>
                                <p class="venda-valor">R$ ${venda.valor.toFixed(2)}</p>
                                <p class="venda-data">${new Date(venda.data).toLocaleDateString('pt-BR')}</p>
                            </div>
                            <div class="venda-acoes">
                                <button class="btn-deletar" onclick="excluirVenda('${venda.id}', '${venda.descricao}')"><i class="fas fa-trash"></i> DELETAR</button>
                            </div>
                        </div>
                    `).join('');
                }
            }
        }

        async function adicionarGasto() {
            const descricao = document.getElementById("gast-descricao").value;
            const valor = parseFloat(document.getElementById("gast-valor").value);
            const data = document.getElementById("gast-data").value;

            if (!descricao || !valor || !data) {
                alert("Preencha todos os campos");
                return;
            }

            const { error } = await supabaseClient
                .from('gastos')
                .insert([{ usuario_id: usuarioId, descricao, valor, data }]);

            if (error) {
                alert("Erro ao registrar gasto: " + error.message);
            } else {
                alert("Gasto registrado com sucesso!");
                document.getElementById("gast-descricao").value = "";
                document.getElementById("gast-valor").value = "";
                document.getElementById("gast-data").value = "";
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

            const listaDiv = document.getElementById("lista-gastos");
            const totalDiv = document.getElementById("total-gast-hoje");

            if (error) {
                listaDiv.innerHTML = `<p style="color: #ef4444;">Erro ao carregar: ${error.message}</p>`;
            } else {
                const hoje = new Date().toISOString().split('T')[0];
                const totalHoje = gastos.filter(g => g.data === hoje).reduce((sum, g) => sum + g.valor, 0);
                totalDiv.textContent = `R$ ${totalHoje.toFixed(2)}`;

                if (!gastos || gastos.length === 0) {
                    listaDiv.innerHTML = `<p style="color: #94a3b8;">Nenhum gasto registrado.</p>`;
                } else {
                    listaDiv.innerHTML = gastos.map(gasto => `
                        <div class="gasto-item" data-gasto-id="${gasto.id}" data-gasto-descricao="${gasto.descricao}">
                            <div class="gasto-info">
                                <p class="gasto-descricao">${gasto.descricao}</p>
                                <p class="gasto-valor">-R$ ${gasto.valor.toFixed(2)}</p>
                                <p class="gasto-data">${new Date(gasto.data).toLocaleDateString('pt-BR')}</p>
                            </div>
                            <div class="gasto-acoes">
                                <button class="btn-deletar" onclick="excluirGasto('${gasto.id}', '${gasto.descricao}')"><i class="fas fa-trash"></i> DELETAR</button>
                            </div>
                        </div>
                    `).join('');
                }
            }
        }

        async function carregarDashboard() {
            if (!usuarioId) return;

            const { data: vendas } = await supabaseClient
                .from('vendas')
                .select('valor')
                .eq('usuario_id', usuarioId);

            const totalVendas = vendas?.reduce((sum, v) => sum + v.valor, 0) || 0;
            document.getElementById("total-vendas").textContent = `R$ ${totalVendas.toFixed(2)}`;

            const { data: devedores } = await supabaseClient
                .from('devedores')
                .select('valor')
                .eq('usuario_id', usuarioId);

            const totalReceber = devedores?.reduce((sum, d) => sum + d.valor, 0) || 0;
            document.getElementById("total-receber").textContent = `R$ ${totalReceber.toFixed(2)}`;

            const { data: gastos } = await supabaseClient
                .from('gastos')
                .select('valor')
                .eq('usuario_id', usuarioId);

            const totalGastos = gastos?.reduce((sum, g) => sum + g.valor, 0) || 0;
            document.getElementById("total-gastos").textContent = `R$ ${totalGastos.toFixed(2)}`;
        }

        function filtrarDevedores() {
            const termo = document.getElementById("filtro-devedores").value.toLowerCase();
            const devedores = document.querySelectorAll(".devedor-item");

            devedores.forEach(devedor => {
                const nome = devedor.getAttribute('data-devedor-nome').toLowerCase();
                if (nome.includes(termo)) {
                    devedor.style.display = 'flex';
                } else {
                    devedor.style.display = 'none';
                }
            });
        }

        async function excluirDevedor(id, nome) {
            const confirmar = confirm(`Tem certeza que deseja deletar o devedor "${nome}"?`);
            if (!confirmar) return;

            const { error } = await supabaseClient
                .from('devedores')
                .delete()
                .eq('id', id)
                .eq('usuario_id', usuarioId);

            if (error) {
                alert("Erro ao deletar devedor: " + error.message);
            } else {
                alert("Devedor deletado com sucesso!");
                carregarDevedores();
                carregarDashboard();
            }
        }

        async function excluirVenda(id, descricao) {
            const confirmar = confirm(`Tem certeza que deseja deletar a venda "${descricao}"?`);
            if (!confirmar) return;

            const { error } = await supabaseClient
                .from('vendas')
                .delete()
                .eq('id', id)
                .eq('usuario_id', usuarioId);

            if (error) {
                alert("Erro ao deletar venda: " + error.message);
            } else {
                alert("Venda deletada com sucesso!");
                carregarVendas();
                carregarDashboard();
            }
        }

        async function excluirGasto(id, descricao) {
            const confirmar = confirm(`Tem certeza que deseja deletar o gasto "${descricao}"?`);
            if (!confirmar) return;

            const { error } = await supabaseClient
                .from('gastos')
                .delete()
                .eq('id', id)
                .eq('usuario_id', usuarioId);

            if (error) {
                alert("Erro ao deletar gasto: " + error.message);
            } else {
                alert("Gasto deletado com sucesso!");
                carregarGastos();
                carregarDashboard();
            }
        }

        async function zerarDashboard() {
            const confirmar = confirm("Tem certeza que deseja deletar TODOS os registros? Esta ação é irreversível!");
            if (!confirmar) return;

            try {
                await supabaseClient.from('devedores').delete().eq('usuario_id', usuarioId);
                await supabaseClient.from('vendas').delete().eq('usuario_id', usuarioId);
                await supabaseClient.from('gastos').delete().eq('usuario_id', usuarioId);

                alert("Dashboard zerado com sucesso!");
                carregarDevedores();
                carregarVendas();
                carregarGastos();
                carregarDashboard();
            } catch (error) {
                alert("Erro ao zerar dashboard: " + error.message);
            }
        }

        async function gerarRelatorioPDF(tipo) {
    try {
        const previewDiv = document.getElementById('preview-relatorio');
        const conteudoDiv = document.getElementById('conteudo-relatorio');

        if (!usuarioId) {
            alert("Erro: Usuário não identificado");
            return;
        }

        const [devedoresResult, vendasResult, gastosResult] = await Promise.all([
            supabaseClient.from('devedores').select('id, nome, valor, data_vencimento, status').eq('usuario_id', usuarioId),
            supabaseClient.from('vendas').select('id, descricao, valor, data').eq('usuario_id', usuarioId),
            supabaseClient.from('gastos').select('id, descricao, valor, data').eq('usuario_id', usuarioId)
        ]);

        const devedores = devedoresResult.data || [];
        const vendas = vendasResult.data || [];
        const gastos = gastosResult.data || [];

        const totalVendas = vendas.reduce((sum, v) => sum + v.valor, 0);
        const totalGastos = gastos.reduce((sum, g) => sum + g.valor, 0);
        const totalReceber = devedores.reduce((sum, d) => sum + d.valor, 0);
        const saldo = totalVendas - totalGastos;

        const dataAtual = new Date();

        let html = `
        <div style="font-family: Inter, sans-serif; color:#1e293b; padding:50px 40px;">

            <!-- HEADER -->
            <div style="border-bottom:2px solid #e2e8f0; padding-bottom:20px; margin-bottom:30px;">
                <h1 style="margin:0; font-size:22px;">Relatório Financeiro</h1>
                <p style="margin:5px 0 0; font-size:13px; color:#64748b;">
                    ${dataAtual.toLocaleDateString('pt-BR')} - ${dataAtual.toLocaleTimeString('pt-BR')}
                </p>
            </div>

            <!-- RESUMO EXECUTIVO -->
            <div style="display:flex; gap:15px; margin-bottom:35px;">
                ${cardResumo("Vendas", totalVendas, "#16a34a")}
                ${cardResumo("Gastos", totalGastos, "#dc2626")}
                ${cardResumo("A Receber", totalReceber, "#2563eb")}
                ${cardResumo("Saldo", saldo, "#000")}
            </div>
        `;

        if (tipo === 'completo' || tipo === 'vendas') {
            html += secaoTabela("Vendas", vendas.map(v => ({
                nome: v.descricao,
                valor: v.valor,
                data: v.data
            })));
        }

        if (tipo === 'completo' || tipo === 'gastos') {
            html += secaoTabela("Gastos", gastos.map(g => ({
                nome: g.descricao,
                valor: g.valor,
                data: g.data
            })));
        }

        if (tipo === 'completo' || tipo === 'devedores') {
            html += secaoTabela("Devedores", devedores.map(d => ({
                nome: d.nome,
                valor: d.valor,
                data: d.data_vencimento
            })));
        }

        html += `
            <div style="margin-top:40px; border-top:1px solid #e2e8f0; padding-top:10px;">
                <p style="font-size:11px; color:#94a3b8;">
                    Documento gerado automaticamente pelo DINHEIRO PRO - Gerencie suas finanças com inteligência e praticidade.
                </p>
            </div>
        </div>
        `;

        conteudoDiv.innerHTML = html;
        previewDiv.style.display = 'block';

    } catch (error) {
        alert("Erro ao gerar relatório: " + error.message);
    }
}
        function gerarSecaoDevedores(devedores, total) {
            if (!devedores || devedores.length === 0) {
                return `
                    <div style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #999;">
                        <h2 style="margin-top: 0; color: #333; font-size: 16px;">DEVEDORES - SEM REGISTROS</h2>
                        <p style="color: #666; margin: 0;">Nenhum devedor registrado no sistema.</p>
                    </div>
                `;
            }

            let html = `
                <div style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #2dd4bf;">
                    <h2 style="margin-top: 0; color: #333; font-size: 16px; margin-bottom: 15px;">📋 DEVEDORES</h2>
                    <p style="color: #666; margin: 0 0 15px 0; font-size: 12px;">Total a Receber: <strong style="color: #2dd4bf; font-size: 14px;">R$ ${total.toFixed(2)}</strong></p>
                    <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
                        <thead>
                            <tr style="background: #ddd; color: #333;">
                                <th style="padding: 8px; text-align: left; border: 1px solid #ccc;">Nome</th>
                                <th style="padding: 8px; text-align: right; border: 1px solid #ccc;">Valor</th>
                                <th style="padding: 8px; text-align: center; border: 1px solid #ccc;">Vencimento</th>
                                <th style="padding: 8px; text-align: center; border: 1px solid #ccc;">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${devedores.map((d, idx) => `
                                <tr style="background: ${idx % 2 === 0 ? '#fafafa' : '#fff'};">
                                    <td style="padding: 8px; border: 1px solid #eee; color: #333;">${d.nome}</td>
                                    <td style="padding: 8px; border: 1px solid #eee; text-align: right; color: #2dd4bf; font-weight: bold;">R$ ${d.valor.toFixed(2)}</td>
                                    <td style="padding: 8px; border: 1px solid #eee; text-align: center; color: #666;">${new Date(d.data_vencimento).toLocaleDateString('pt-BR')}</td>
                                    <td style="padding: 8px; border: 1px solid #eee; text-align: center; color: #a855f7;">${d.status}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
            return html;
        }

        function gerarSecaoVendas(vendas, total) {
            if (!vendas || vendas.length === 0) {
                return `
                    <div style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #999;">
                        <h2 style="margin-top: 0; color: #333; font-size: 16px;">VENDAS - SEM REGISTROS</h2>
                        <p style="color: #666; margin: 0;">Nenhuma venda registrada no sistema.</p>
                    </div>
                `;
            }

            const vendasOrdenadas = [...vendas].sort((a, b) => new Date(b.data) - new Date(a.data));

            let html = `
                <div style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #f59e0b;">
                    <h2 style="margin-top: 0; color: #333; font-size: 16px; margin-bottom: 15px;">📊 VENDAS</h2>
                    <p style="color: #666; margin: 0 0 15px 0; font-size: 12px;">Total de Vendas: <strong style="color: #f59e0b; font-size: 14px;">R$ ${total.toFixed(2)}</strong></p>
                    <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
                        <thead>
                            <tr style="background: #ddd; color: #333;">
                                <th style="padding: 8px; text-align: left; border: 1px solid #ccc;">Descrição</th>
                                <th style="padding: 8px; text-align: right; border: 1px solid #ccc;">Valor</th>
                                <th style="padding: 8px; text-align: center; border: 1px solid #ccc;">Data</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${vendasOrdenadas.map((v, idx) => `
                                <tr style="background: ${idx % 2 === 0 ? '#fafafa' : '#fff'};">
                                    <td style="padding: 8px; border: 1px solid #eee; color: #333;">${v.descricao}</td>
                                    <td style="padding: 8px; border: 1px solid #eee; text-align: right; color: #f59e0b; font-weight: bold;">R$ ${v.valor.toFixed(2)}</td>
                                    <td style="padding: 8px; border: 1px solid #eee; text-align: center; color: #666;">${new Date(v.data).toLocaleDateString('pt-BR')}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
            return html;
        }

        function gerarSecaoGastos(gastos, total) {
            if (!gastos || gastos.length === 0) {
                return `
                    <div style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #999;">
                        <h2 style="margin-top: 0; color: #333; font-size: 16px;">GASTOS - SEM REGISTROS</h2>
                        <p style="color: #666; margin: 0;">Nenhum gasto registrado no sistema.</p>
                    </div>
                `;
            }

            const gastosOrdenados = [...gastos].sort((a, b) => new Date(b.data) - new Date(a.data));

            let html = `
                <div style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #a855f7;">
                    <h2 style="margin-top: 0; color: #333; font-size: 16px; margin-bottom: 15px;">💰 GASTOS</h2>
                    <p style="color: #666; margin: 0 0 15px 0; font-size: 12px;">Total de Gastos: <strong style="color: #a855f7; font-size: 14px;">R$ ${total.toFixed(2)}</strong></p>
                    <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
                        <thead>
                            <tr style="background: #ddd; color: #333;">
                                <th style="padding: 8px; text-align: left; border: 1px solid #ccc;">Descrição</th>
                                <th style="padding: 8px; text-align: right; border: 1px solid #ccc;">Valor</th>
                                <th style="padding: 8px; text-align: center; border: 1px solid #ccc;">Data</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${gastosOrdenados.map((g, idx) => `
                                <tr style="background: ${idx % 2 === 0 ? '#fafafa' : '#fff'};">
                                    <td style="padding: 8px; border: 1px solid #eee; color: #333;">${g.descricao}</td>
                                    <td style="padding: 8px; border: 1px solid #eee; text-align: right; color: #a855f7; font-weight: bold;">-R$ ${g.valor.toFixed(2)}</td>
                                    <td style="padding: 8px; border: 1px solid #eee; text-align: center; color: #666;">${new Date(g.data).toLocaleDateString('pt-BR')}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
            return html;
        }

       
        
            function cardResumo(titulo, valor, cor) {
    return `
    <div style="flex:1; background:#f8fafc; padding:15px; border-radius:8px;">
        <p style="margin:0; font-size:12px; color:#64748b;">${titulo}</p>
        <h2 style="margin:5px 0 0; color:${cor};">R$ ${valor.toFixed(2)}</h2>
    </div>
    `;
}

function secaoTabela(titulo, lista) {
    return `
    <h3 style="margin-bottom:10px;">${titulo}</h3>

    <table style="width:100%; border-collapse:collapse; font-size:13px; margin-bottom:30px;">
        <thead>
            <tr style="background:#f1f5f9;">
                <th style="text-align:left; padding:10px;">Descrição</th>
                <th style="text-align:left; padding:10px;">Data</th>
                <th style="text-align:right; padding:10px;">Valor</th>
            </tr>
        </thead>
        <tbody>
            ${lista.map(item => `
                <tr>
                    <td style="padding:10px; border-bottom:1px solid #e2e8f0;">${item.nome}</td>
                    <td style="padding:10px;">${formatarData(item.data)}</td>
                    <td style="padding:10px; text-align:right;">R$ ${item.valor.toFixed(2)}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
    `;
}

function formatarData(data) {
    if (!data) return "-";
    return new Date(data).toLocaleDateString('pt-BR');}

        function gerarSecaoResumo(totalVendas, totalGastos, totalReceber) {
            const lucro = totalVendas - totalGastos;
            const lucroColor = lucro >= 0 ? '#10b981' : '#ef4444';
            const lucroLabel = lucro >= 0 ? 'LUCRO' : 'PREJUÍZO';

            return `
                <div style="background: #000; color: #fff; padding: 25px; margin: 30px 0; border-radius: 8px; border: 2px solid #06b6d4;">
                    <h2 style="margin-top: 0; color: #06b6d4; font-size: 18px; text-align: center; margin-bottom: 20px;">📈 RESUMO EXECUTIVO</h2>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 12px; border-bottom: 1px solid #444; width: 50%; color: #888;">Total de Vendas</td>
                            <td style="padding: 12px; border-bottom: 1px solid #444; text-align: right; color: #f59e0b; font-weight: bold; font-size: 16px;">R$ ${totalVendas.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px; border-bottom: 1px solid #444; width: 50%; color: #888;">Total de Gastos</td>
                            <td style="padding: 12px; border-bottom: 1px solid #444; text-align: right; color: #a855f7; font-weight: bold; font-size: 16px;">R$ ${totalGastos.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px; border-bottom: 1px solid #444; width: 50%; color: #888;">Total a Receber</td>
                            <td style="padding: 12px; border-bottom: 1px solid #444; text-align: right; color: #2dd4bf; font-weight: bold; font-size: 16px;">R$ ${totalReceber.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px; width: 50%; color: #fff; font-weight: bold; font-size: 14px;">↳ ${lucroLabel}</td>
                            <td style="padding: 12px; text-align: right; color: ${lucroColor}; font-weight: bold; font-size: 18px;">R$ ${Math.abs(lucro).toFixed(2)}</td>
                        </tr>
                    </table>
                </div>
            `;
        }

        async function downloadRelatorioPDF() {
    const element = document.getElementById('conteudo-relatorio');

    const canvas = await html2canvas(element, {
        scale: 4,
        backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/jpeg', 1);
    const pdf = new jspdf.jsPDF('p', 'mm', 'a4');

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 10;

    const imgWidth = pageWidth - margin * 2;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = margin;

    pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
    heightLeft -= (pageHeight - margin * 2);

    while (heightLeft > 0) {
        position = heightLeft - imgHeight + margin;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
        heightLeft -= (pageHeight - margin * 2);
    }

    pdf.save('relatorio.pdf');
}

        window.addEventListener('load', gerenciarTelas);
        
        supabaseClient.auth.onAuthStateChange((event, session) => {
            gerenciarTelas();
        });
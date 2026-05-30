import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from 'firebase/firestore';

import { db } from './src/services/firebaseConfig';

interface Produto {
  id: string;
  nome: string;
  preco: number;
}

const CORES = {
  gradiente1: '#3FADD6',
  gradiente2: '#FF8E53',
  gradiente3: '#FFA500',
  primaria: '#007AFF',
  primaria2: '#0A84FF',
  sucesso: '#34C759',
  sucesso2: '#30B0C0',
  perigo: '#FF3B30',
  perigo2: '#FF453A',
  fundo: '#0F0F0F',
  fundoCard: '#1A1A1A',
  texto: '#FFFFFF',
  textoCinza: '#999',
  borda: '#333333',
  destaque: '#FFD60A',
};

export default function App() {
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [adicionando, setAdicionando] = useState(false);
  const [pressedButton, setPressedButton] = useState<string | null>(null);

  async function adicionarProduto() {
    if (nome.trim() === '' || preco.trim() === '') {
      Alert.alert('⚠️ Atenção', 'Preencha o nome e o preço');
      return;
    }

    const precoNumerico = parseFloat(preco);

    if (precoNumerico <= 0 || isNaN(precoNumerico)) {
      Alert.alert('❌ Erro', 'Digite um preço válido');
      return;
    }

    setAdicionando(true);
    try {
      await addDoc(collection(db, 'products'), {
        nome: nome.trim(),
        preco: precoNumerico,
        criadoEm: new Date().toISOString(),
      });

      setNome('');
      setPreco('');
      await buscarProdutos();
      Alert.alert('✅ Sucesso', 'Produto cadastrado com sucesso!');
    } catch (error) {
      Alert.alert('❌ Erro', 'Falha ao cadastrar produto');
      console.error(error);
    } finally {
      setAdicionando(false);
    }
  }

  async function buscarProdutos() {
    setCarregando(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const lista: Produto[] = [];

      querySnapshot.forEach((docItem) => {
        lista.push({
          id: docItem.id,
          nome: docItem.data().nome,
          preco: docItem.data().preco,
        });
      });

      setProdutos(lista);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      Alert.alert('❌ Erro', 'Não foi possível carregar os produtos');
    } finally {
      setCarregando(false);
    }
  }

  async function removerProduto(id: string, nome: string) {
    Alert.alert('🗑️ Remover Produto', `Deseja remover "${nome}"?`, [
      { text: 'Cancelar', onPress: () => {}, style: 'cancel' },
      {
        text: 'Remover',
        onPress: async () => {
          setCarregando(true);
          try {
            console.log('Deletando produto com ID:', id);
            const docRef = doc(db, 'products', id);
            console.log('Referência do documento:', docRef);
            await deleteDoc(docRef);
            console.log('Produto deletado com sucesso');
            await buscarProdutos();
            Alert.alert('✅ Sucesso', 'Produto removido com sucesso!');
          } catch (error) {
            console.error('Erro ao remover produto:', error);
            Alert.alert('❌ Erro', `Falha ao remover produto: ${error}`);
          } finally {
            setCarregando(false);
          }
        },
        style: 'destructive',
      },
    ]);
  }

  async function atualizarPreco(id: string, precoAtual: number) {
    const novoPreco = parseFloat((precoAtual + 1).toFixed(2));

    try {
      await updateDoc(doc(db, 'products', id), {
        preco: novoPreco,
        atualizadoEm: new Date().toISOString(),
      });
      await buscarProdutos();
    } catch (error) {
      Alert.alert('❌ Erro', 'Falha ao atualizar preço');
      console.error(error);
    }
  }

  useEffect(() => {
    buscarProdutos();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header com Gradiente */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.titulo}>FoodExpress</Text>
            <Text style={styles.subtitulo}>Seu gerenciador de pedidos</Text>
            <View style={styles.statsContainer}>
              <View style={styles.stat}>
                <Text style={styles.statNumero}>{produtos.length}</Text>
                <Text style={styles.statLabel}>Produtos</Text>
              </View>
              <View style={styles.divisor} />
              <View style={styles.stat}>
                <Text style={styles.statNumero}>
                  R$ {produtos.reduce((acc, p) => acc + p.preco, 0).toFixed(2).replace('.', ',')}
                </Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Formulário */}
        <View style={styles.formulario}>
          <View style={styles.formularioHeader}>
            <Text style={styles.labelSecao}>➕ Novo Produto</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>RÁPIDO</Text>
            </View>
          </View>

          <View style={styles.dividerLine} />

          <View style={styles.inputGroup}>
            <Text style={styles.label}>📝 Nome do Lanche</Text>
            <TextInput
              placeholder="Ex: Pizza Margherita"
              value={nome}
              onChangeText={setNome}
              style={styles.input}
              editable={!adicionando}
              placeholderTextColor={CORES.textoCinza}
              maxLength={50}
            />
            <Text style={styles.contador}>{nome.length}/50</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>💰 Preço (R$)</Text>
            <TextInput
              placeholder="Ex: 29.90"
              value={preco}
              onChangeText={setPreco}
              keyboardType="decimal-pad"
              style={styles.input}
              editable={!adicionando}
              placeholderTextColor={CORES.textoCinza}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.botaoCadastrar,
              adicionando && styles.botaoDesabilitado,
              pressedButton === 'cadastrar' && styles.botaoPressionado,
            ]}
            onPress={adicionarProduto}
            onPressIn={() => setPressedButton('cadastrar')}
            onPressOut={() => setPressedButton(null)}
            disabled={adicionando}
          >
            {adicionando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.textoBotaoCadastrar}>CADASTRAR PRODUTO</Text>
                <View style={styles.brilho} />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Lista de Produtos */}
        <View style={styles.secaoLista}>
          <View style={styles.headerLista}>
            <View>
              <Text style={styles.labelSecao}>📦 Seus Produtos</Text>
              <Text style={styles.subtituloLista}>
                {produtos.length} {produtos.length === 1 ? 'item' : 'itens'} no cardápio
              </Text>
            </View>
            {!carregando && (
              <TouchableOpacity
                style={styles.botaoRecarregar}
                onPress={buscarProdutos}
                onPressIn={() => setPressedButton('reload')}
                onPressOut={() => setPressedButton(null)}
              >
                <Text style={[styles.emoji, { fontSize: 24 }]}>🔄</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.dividerLine} />

          {carregando ? (
            <View style={styles.carregandoContainer}>
              <ActivityIndicator size="large" color={CORES.gradiente2} />
              <Text style={styles.textoCinzaGrande}>Carregando produtos...</Text>
            </View>
          ) : produtos.length === 0 ? (
            <View style={styles.vazioContainer}>
              <Text style={styles.emojiGrande}>🍽️</Text>
              <Text style={styles.textoVazio}>Nenhum produto ainda</Text>
              <Text style={styles.textoCinzaGrande}>
                Comece adicionando um novo produto acima
              </Text>
            </View>
          ) : (
            <FlatList
              data={produtos}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.separador} />}
              renderItem={({ item, index }) => (
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardIndex}>
                      <Text style={styles.cardIndexText}>{index + 1}</Text>
                    </View>
                    <View style={styles.infosProduto}>
                      <Text style={styles.nomeProduto}>{item.nome}</Text>
                      <View style={styles.precoContainer}>
                        <Text style={styles.precoProduto}>
                          R$ {item.preco.toFixed(2).replace('.', ',')}
                        </Text>
                        <View style={styles.badge2}>
                          <Text style={styles.badge2Text}>Em alta</Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  <View style={styles.acoes}>
                    <TouchableOpacity
                      style={[
                        styles.botaoAcao,
                        pressedButton === `price-${item.id}` && styles.botaoAcaoPressionado,
                      ]}
                      onPress={() => atualizarPreco(item.id, item.preco)}
                      onPressIn={() => setPressedButton(`price-${item.id}`)}
                      onPressOut={() => setPressedButton(null)}
                    >
                      <Text style={styles.textoAcao}>📈 +R$1</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.botaoAcao,
                        styles.botaoPerigo,
                        pressedButton === `delete-${item.id}` && styles.botaoPerigoPressionado,
                      ]}
                      onPress={() => removerProduto(item.id, item.nome)}
                      onPressIn={() => setPressedButton(`delete-${item.id}`)}
                      onPressOut={() => setPressedButton(null)}
                    >
                      <Text style={styles.textoAcaoPerigo}>🗑️ Remover</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Versão 1.2</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CORES.fundo,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
    backgroundColor: '#3FADD6',
  },
  headerContent: {
    alignItems: 'center',
  },
  emoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  titulo: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitulo: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 6,
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statNumero: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  divisor: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 15,
  },
  formulario: {
    backgroundColor: CORES.fundoCard,
    margin: 16,
    marginTop: 20,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: CORES.borda,
    shadowColor: CORES.gradiente1,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  formularioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  labelSecao: {
    fontSize: 18,
    fontWeight: 'bold',
    color: CORES.texto,
  },
  badge: {
    backgroundColor: CORES.destaque,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000',
  },
  dividerLine: {
    height: 1,
    backgroundColor: CORES.borda,
    marginVertical: 14,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: CORES.destaque,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1.5,
    borderColor: CORES.borda,
    padding: 14,
    borderRadius: 12,
    fontSize: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    color: CORES.texto,
  },
  contador: {
    fontSize: 11,
    color: CORES.textoCinza,
    marginTop: 6,
    textAlign: 'right',
  },
  botaoCadastrar: {
    backgroundColor: CORES.sucesso2,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: CORES.sucesso2,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
    overflow: 'hidden',
  },
  botaoDesabilitado: {
    opacity: 0.6,
  },
  botaoPressionado: {
    transform: [{ scale: 0.98 }],
  },
  textoBotaoCadastrar: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  brilho: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '30%',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  secaoLista: {
    backgroundColor: CORES.fundoCard,
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: CORES.borda,
    marginBottom: 30,
    shadowColor: CORES.primaria,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  headerLista: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  subtituloLista: {
    fontSize: 12,
    color: CORES.textoCinza,
    marginTop: 6,
  },
  botaoRecarregar: {
    padding: 10,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: CORES.borda,
  },
  carregandoContainer: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  vazioContainer: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  emojiGrande: {
    fontSize: 60,
    marginBottom: 16,
  },
  textoVazio: {
    fontSize: 18,
    fontWeight: '700',
    color: CORES.texto,
    marginBottom: 8,
  },
  textoCinzaGrande: {
    fontSize: 14,
    color: CORES.textoCinza,
  },
  separador: {
    height: 1,
    backgroundColor: CORES.borda,
    marginVertical: 12,
  },
  card: {
    borderWidth: 1,
    borderColor: CORES.borda,
    padding: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.02)',
    marginVertical: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  cardIndex: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: CORES.gradiente2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardIndexText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  infosProduto: {
    flex: 1,
  },
  nomeProduto: {
    fontSize: 16,
    fontWeight: '700',
    color: CORES.texto,
    marginBottom: 6,
  },
  precoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  precoProduto: {
    fontSize: 20,
    fontWeight: 'bold',
    color: CORES.destaque,
  },
  badge2: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  badge2Text: {
    fontSize: 10,
    color: CORES.destaque,
    fontWeight: 'bold',
  },
  acoes: {
    flexDirection: 'row',
    gap: 10,
  },
  botaoAcao: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: CORES.primaria2,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: CORES.primaria,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  botaoAcaoPressionado: {
    transform: [{ scale: 0.96 }],
  },
  botaoPerigo: {
    backgroundColor: 'rgba(255, 59, 48, 0.15)',
    borderWidth: 1,
    borderColor: CORES.perigo,
  },
  botaoPerigoPressionado: {
    transform: [{ scale: 0.96 }],
  },
  textoAcao: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  textoAcaoPerigo: {
    color: CORES.perigo,
    fontSize: 13,
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
    borderTopWidth: 1,
    borderTopColor: CORES.borda,
    marginHorizontal: 16,
  },
  footerText: {
    fontSize: 12,
    color: CORES.textoCinza,
    fontWeight: '600',
  },
  footerSubtext: {
    fontSize: 12,
    color: CORES.textoCinza,
    marginTop: 6,
  },
});
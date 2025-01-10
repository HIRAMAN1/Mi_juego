import React, { useState, useEffect } from 'react';
import { TreePine, Rabbit, Star, Volume2, Timer, ArrowRight, Trophy } from 'lucide-react';

type TreeType = {
  id: number;
  fruits: number;
  type: 'many' | 'few' | 'none';
};

type Level = 1 | 2 | 3 | 4;
type DropZone = 'many' | 'few';

export default function App() {
  const [level, setLevel] = useState<Level>(1);
  const [currentTask, setCurrentTask] = useState<'many' | 'few'>('few');
  const [showSuccess, setShowSuccess] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [inputCount, setInputCount] = useState<string>('');
  const [showCountPrompt, setShowCountPrompt] = useState(false);
  const [selectedTreeId, setSelectedTreeId] = useState<number | null>(null);
  const [showGameComplete, setShowGameComplete] = useState(false);
  const [level3Trees, setLevel3Trees] = useState<TreeType[]>([]);
  const [level3Score, setLevel3Score] = useState(0);
  const [sortedTrees, setSortedTrees] = useState<{
    many: TreeType[];
    few: TreeType[];
    unsorted: TreeType[];
  }>({
    many: [],
    few: [],
    unsorted: []
  });

  const generateRandomTrees = (level: Level) => {
    const getRandomNumber = (min: number, max: number) => 
      Math.floor(Math.random() * (max - min + 1)) + min;

    let trees: TreeType[] = [];
    
    switch(level) {
      case 1:
        trees = [
          { id: 1, fruits: getRandomNumber(5, 8), type: 'many' },
          { id: 2, fruits: getRandomNumber(1, 3), type: 'few' },
          { id: 3, fruits: 0, type: 'none' },
        ];
        break;
      case 2:
        trees = [
          { id: 1, fruits: getRandomNumber(7, 9), type: 'many' },
          { id: 2, fruits: getRandomNumber(1, 3), type: 'few' },
          { id: 3, fruits: getRandomNumber(6, 8), type: 'many' },
          { id: 4, fruits: getRandomNumber(2, 4), type: 'few' },
        ];
        break;
      case 3:
        trees = [
          { id: 1, fruits: getRandomNumber(7, 9), type: 'many' },
          { id: 2, fruits: getRandomNumber(1, 3), type: 'few' },
          { id: 3, fruits: getRandomNumber(8, 10), type: 'many' },
          { id: 4, fruits: getRandomNumber(2, 4), type: 'few' },
          { id: 5, fruits: getRandomNumber(6, 8), type: 'many' },
          { id: 6, fruits: getRandomNumber(1, 3), type: 'few' },
        ];
        break;
      case 4:
        trees = [
          { id: 1, fruits: getRandomNumber(7, 9), type: 'many' },
          { id: 2, fruits: getRandomNumber(1, 3), type: 'few' },
          { id: 3, fruits: getRandomNumber(6, 8), type: 'many' },
          { id: 4, fruits: getRandomNumber(2, 4), type: 'few' },
          { id: 5, fruits: getRandomNumber(8, 10), type: 'many' },
          { id: 6, fruits: getRandomNumber(1, 3), type: 'few' },
        ];
        if (level === 4) {
          setSortedTrees({
            many: [],
            few: [],
            unsorted: trees
          });
        }
        break;
    }
    return trees;
  };

  const [trees, setTrees] = useState<TreeType[]>(generateRandomTrees(1));

  useEffect(() => {
    if (level === 3) {
      setTimeLeft(30);
      setIsTimerRunning(true);
      setLevel3Trees(generateRandomTrees(3));
      setLevel3Score(0);
      setCurrentTask('many');
    } else {
      setIsTimerRunning(false);
      setTrees(generateRandomTrees(level));
    }
  }, [level]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isTimerRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Reiniciar nivel 3 si se acaba el tiempo
      setTimeLeft(30);
      setLevel3Trees(generateRandomTrees(3));
      setLevel3Score(0);
      setCurrentTask('many');
    }
    return () => clearInterval(timer);
  }, [isTimerRunning, timeLeft]);

  const handleTreeClick = (tree: TreeType) => {
    if (level === 3) {
      if (tree.type === currentTask) {
        setShowSuccess(true);
        setLevel3Score(prev => prev + 1);
        setTimeout(() => {
          setShowSuccess(false);
          setCurrentTask(prev => prev === 'few' ? 'many' : 'few');
          if (level3Score >= 5) { // Si ya clasificó 6 árboles correctamente
            setLevel(4);
          }
        }, 1000);
      }
    } else if (level !== 4) {
      if (level === 2 && tree.type !== currentTask) {
        setShowCountPrompt(true);
        setSelectedTreeId(tree.id);
        return;
      }

      if (tree.type === currentTask) {
        setShowSuccess(true);
        setScore(prev => prev + 1);
        setTimeout(() => {
          setShowSuccess(false);
          setCurrentTask(prev => prev === 'few' ? 'many' : 'few');
          setTrees(generateRandomTrees(level));
          // 5 puntos para nivel 1 y 2
          if (score >= (level === 1 ? 4 : 4)) {
            setLevel(prev => (prev + 1) as Level);
            setScore(0);
          }
        }, 2000);
      }
    }
  };

  const handleDragStart = (e: React.DragEvent, tree: TreeType) => {
    e.dataTransfer.setData('tree', JSON.stringify(tree));
  };

  const handleDrop = (e: React.DragEvent, zone: DropZone) => {
    e.preventDefault();
    const tree = JSON.parse(e.dataTransfer.getData('tree')) as TreeType;
    
    setSortedTrees(prev => {
      const newUnsorted = prev.unsorted.filter(t => t.id !== tree.id);
      const newZone = zone === 'many' ? 'many' : 'few';
      const newSorted = {
        ...prev,
        [newZone]: [...prev[newZone], tree],
        unsorted: newUnsorted
      };

      if (newUnsorted.length === 0) {
        const allCorrect = newSorted.many.every(t => t.type === 'many') &&
                          newSorted.few.every(t => t.type === 'few');
        if (allCorrect) {
          setTimeout(() => {
            setShowGameComplete(true);
          }, 500);
        }
      }

      return newSorted;
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleCountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedTree = trees.find(t => t.id === selectedTreeId);
    if (selectedTree && Number(inputCount) === selectedTree.fruits) {
      setShowSuccess(true);
      setScore(prev => prev + 1);
      setTimeout(() => {
        setShowSuccess(false);
        setShowCountPrompt(false);
        setInputCount('');
        if (score >= 4) { // 5 puntos para pasar de nivel 2
          setLevel(3);
          setScore(0);
        }
      }, 2000);
    }
    setInputCount('');
  };

  const renderTree = (tree: TreeType, isDraggable = false) => (
    <div
      key={tree.id}
      draggable={isDraggable}
      onDragStart={(e) => handleDragStart(e, tree)}
      onClick={() => !isDraggable && handleTreeClick(tree)}
      className="relative cursor-pointer transform hover:scale-105 transition-transform bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-lg border-2 border-green-200"
    >
      <TreePine className="w-24 h-24 mx-auto text-green-600" />
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {Array.from({ length: tree.fruits }).map((_, i) => (
          <img
            key={i}
            src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cpath fill='%23ff0000' d='M256 0C114.6 0 0 114.6 0 256s114.6 256 256 256s256-114.6 256-256S397.4 0 256 0z'/%3E%3C/svg%3E"
            alt="Manzana"
            className="w-6 h-6 animate-bounce"
            style={{ 
              animationDelay: `${i * 0.1}s`,
              animationDuration: '1s'
            }}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div 
      className="min-h-screen relative bg-gradient-to-b from-sky-300 via-sky-200 to-green-200"
    >
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-8 right-16 w-24 h-24 rounded-full bg-yellow-300" 
             style={{filter: 'drop-shadow(0 0 20px rgba(255, 255, 0, 0.5))'}} />
        <div className="absolute top-12 left-1/4 w-24 h-12 bg-white rounded-full opacity-80" />
        <div className="absolute top-20 right-1/3 w-32 h-16 bg-white rounded-full opacity-80" />
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-green-600 to-green-400"
             style={{borderRadius: '100% 100% 0 0'}} />
      </div>

      <div className="relative max-w-6xl mx-auto p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 text-shadow">
            El Bosque Mágico de los Números - Nivel {level}
          </h1>
          
          <div className="flex items-center justify-center gap-4 bg-white/90 rounded-full py-2 px-6 backdrop-blur-sm">
            <Volume2 className="text-green-700" />
            {level === 4 ? (
              <p className="text-2xl text-green-700">
                Clasifica los árboles según la cantidad de frutas
              </p>
            ) : level === 3 ? (
              <p className="text-2xl text-green-700">
                El conejo necesita {currentTask === 'few' ? 'pocos' : 'muchos'} árboles con {currentTask === 'few' ? 'pocas' : 'muchas'} frutas. ¡Tiempo: {timeLeft}s!
              </p>
            ) : (
              <p className="text-2xl text-green-700">
                El conejo necesita un árbol con {currentTask === 'few' ? 'pocas' : 'muchas'} frutas
              </p>
            )}
          </div>

          <div className="mt-4 flex justify-center items-center gap-4 bg-white/80 rounded-full py-2 px-6 backdrop-blur-sm inline-block">
            <Star className="text-yellow-500" fill="currentColor" />
            <span className="text-xl font-bold text-green-700">
              {level === 3 ? `Árboles clasificados: ${level3Score}/6` : `Puntos: ${score}/5`}
            </span>
            {level === 3 && (
              <div className="flex items-center gap-2">
                <Timer className="text-green-700" />
                <span className="text-xl font-bold text-green-700">{timeLeft}s</span>
              </div>
            )}
          </div>
        </div>

        {/* Game Area */}
        <div className="relative">
          {level === 4 ? (
            <div className="grid grid-cols-3 gap-8">
              {/* Zona de árboles sin clasificar */}
              <div className="col-span-1">
                <h2 className="text-xl font-bold text-center mb-4 text-white text-shadow">
                  Árboles por clasificar
                </h2>
                <div className="space-y-4">
                  {sortedTrees.unsorted.map(tree => renderTree(tree, true))}
                </div>
              </div>

              {/* Zonas para soltar */}
              <div className="col-span-2 grid grid-cols-2 gap-8">
                <div
                  onDrop={(e) => handleDrop(e, 'many')}
                  onDragOver={handleDragOver}
                  className="border-4 border-dashed border-yellow-400 rounded-lg p-4 min-h-[400px] bg-yellow-50/50"
                >
                  <h2 className="text-xl font-bold text-center mb-4 text-yellow-700">
                    Muchas Frutas
                  </h2>
                  <div className="space-y-4">
                    {sortedTrees.many.map(tree => renderTree(tree))}
                  </div>
                </div>

                <div
                  onDrop={(e) => handleDrop(e, 'few')}
                  onDragOver={handleDragOver}
                  className="border-4 border-dashed border-blue-400 rounded-lg p-4 min-h-[400px] bg-blue-50/50"
                >
                  <h2 className="text-xl font-bold text-center mb-4 text-blue-700">
                    Pocas Frutas
                  </h2>
                  <div className="space-y-4">
                    {sortedTrees.few.map(tree => renderTree(tree))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-8">
              {(level === 3 ? level3Trees : trees).map((tree) => renderTree(tree))}
            </div>
          )}

          {/* Count Prompt */}
          {showCountPrompt && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
              <div className="bg-white rounded-lg p-8">
                <h3 className="text-xl font-bold mb-4">¿Cuántas frutas tiene este árbol?</h3>
                <form onSubmit={handleCountSubmit} className="flex gap-4">
                  <input
                    type="number"
                    value={inputCount}
                    onChange={(e) => setInputCount(e.target.value)}
                    className="border rounded px-3 py-2"
                    min="0"
                    max="10"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  >
                    Comprobar
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Success Animation */}
          {showSuccess && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white/90 backdrop-blur-sm rounded-lg p-8 shadow-xl">
                <div className="text-center">
                  <Rabbit className="w-16 h-16 mx-auto text-green-600 animate-bounce" />
                  <p className="text-2xl font-bold text-green-800 mt-4">
                    ¡Muy bien!
                  </p>
                  {level < 4 && ((level === 3 && level3Score >= 5) || (level !== 3 && score >= 4)) && (
                    <div className="mt-2 flex items-center justify-center gap-2">
                      <p className="text-lg text-green-600">¡Siguiente nivel!</p>
                      <ArrowRight className="text-green-600" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Game Complete */}
          {showGameComplete && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
              <div className="bg-white/90 backdrop-blur-sm rounded-lg p-8 shadow-xl text-center">
                <Trophy className="w-24 h-24 mx-auto text-yellow-500 animate-bounce" />
                <h2 className="text-3xl font-bold text-green-800 mt-4">
                  ¡Felicitaciones!
                </h2>
                <p className="text-xl text-green-700 mt-2">
                  Has completado el juego con éxito
                </p>
                <button
                  onClick={() => {
                    setLevel(1);
                    setScore(0);
                    setShowGameComplete(false);
                    setSortedTrees({many: [], few: [], unsorted: []});
                  }}
                  className="mt-6 bg-green-500 text-white px-6 py-3 rounded-full hover:bg-green-600 transition-colors"
                >
                  Jugar de nuevo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
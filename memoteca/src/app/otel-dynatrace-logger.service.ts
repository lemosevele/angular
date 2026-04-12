import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';

/**
 * Service para enviar logs via OpenTelemetry Protocol (OTLP)
 * Envia para OpenTelemetry Collector (local em Docker)
 * O Collector serializa em Protobuf e envia para Dynatrace
 * 
 * Documentação:
 * - https://docs.dynatrace.com/docs/ingest-from/opentelemetry
 * - https://opentelemetry.io/docs/reference/specification/logs/data-model/
 */
@Injectable({
  providedIn: 'root'
})
export class OtelDynatraceLoggerService {

  // URL do OpenTelemetry Collector (rodando em Docker)
  // Production: mudar para endpoint de produção quando deploy
  private readonly collectorUrl = 'http://localhost:4318/v1/logs';

  // Queue para acumular logs antes de enviar em lotes
  private logQueue: any[] = [];
  private queueTimer: any = null;
  private readonly BATCH_SIZE = 10;
  private readonly BATCH_TIMEOUT_MS = 5000;

  constructor(private http: HttpClient) {
    this.startBatchProcessor();
  }

  /**
   * Envia um log via OTLP para o Collector
   * @param severity Nível: TRACE, DEBUG, INFO, WARN, ERROR, FATAL
   * @param message Conteúdo da mensagem
   * @param source Origem/componente que gerou o log
   * @param attributes Atributos customizados adicionais
   */
  public log(
    severity: string,
    message: string,
    source: string,
    attributes?: Record<string, any>
  ): void {
    const severityNumber = this.mapSeverity(severity);
    const now = Math.floor(Date.now() * 1_000_000); // nanosegundos

    const logRecord = {
      timeUnixNano: now.toString(),
      observedTimeUnixNano: now.toString(),
      severityNumber: severityNumber,
      severityText: severity.toUpperCase(),
      body: {
        stringValue: message
      },
      attributes: this.buildAttributes(source, attributes)
    };
    console.log("logRecord construído:", logRecord);
    this.logQueue.push(logRecord);
    console.log(`✓ Log ${severity} enfileirado (${this.logQueue.length} na fila): ${message}`);

    // Enviar se atingiu tamanho de lote
    if (this.logQueue.length >= this.BATCH_SIZE) {
      this.flushLogs();
    }
  }

  /**
   * Log com severity TRACE (mais verboso)
   */
  public trace(message: string, source: string, attributes?: Record<string, any>): void {
    this.log('TRACE', message, source, attributes);
  }

  /**
   * Log com severity DEBUG
   */
  public debug(message: string, source: string, attributes?: Record<string, any>): void {
    this.log('DEBUG', message, source, attributes);
  }

  /**
   * Log com severity INFO (normal)
   */
  public info(message: string, source: string, attributes?: Record<string, any>): void {
    this.log('INFO', message, source, attributes);
  }

  /**
   * Log com severity WARN
   */
  public warn(message: string, source: string, attributes?: Record<string, any>): void {
    this.log('WARN', message, source, attributes);
  }

  /**
   * Log com severity ERROR
   */
  public error(message: string, source: string, attributes?: Record<string, any>): void {
    this.log('ERROR', message, source, attributes);
  }

  /**
   * Log com severity FATAL (mais crítico)
   */
  public fatal(message: string, source: string, attributes?: Record<string, any>): void {
    this.log('FATAL', message, source, attributes);
  }

  /**
   * Inicia o processador de lotes (envia a cada 5 segundos)
   * Otimiza requisições agrupando logs
   */
  private startBatchProcessor(): void {
    this.queueTimer = setInterval(() => {
      if (this.logQueue.length > 0) {
        console.log(`⏱️ Timer de batch disparo - ${this.logQueue.length} logs na fila`);
        this.flushLogs();
      }
    }, this.BATCH_TIMEOUT_MS);
  }

  /**
   * Envia todos os logs da fila para o Collector
   */
  private flushLogs(): void {
    if (this.logQueue.length === 0) return;

    const logs = this.logQueue.splice(0, this.BATCH_SIZE);
    const payload = this.buildPayload(logs);
    
    console.log(`📤 Enviando ${logs.length} logs para Collector...`);
    this.sendOtlpLogs(payload);
  }

  /**
   * Constrói o payload OTLP conforme especificação OpenTelemetry
   * Estrutura: resourceLogs > scopeLogs > logRecords
   */
  private buildPayload(logRecords: any[]): any {
    return {
      resourceLogs: [
        {
          resource: {
            attributes: [
              {
                key: 'service.name',
                value: {
                  stringValue: 'Angular Memoteca App'
                }
              },
              {
                key: 'service.version',
                value: {
                  stringValue: '1.0.0'
                }
              },
              {
                key: 'service.instance.id',
                value: {
                  stringValue: 'browser-' + Math.random().toString(36).substr(2, 9)
                }
              }
            ]
          },
          scopeLogs: [
            {
              scope: {
                name: 'angular-memoteca-logger',
                version: '1.0.0'
              },
              logRecords: logRecords
            }
          ]
        }
      ]
    };
  }

  /**
   * Constrói os atributos do log
   * Atributos são metadados que ajudam a filtrar e buscar logs
   */
  private buildAttributes(source: string, customAttributes?: Record<string, any>): any[] {
    const attrs: any[] = [
      {
        key: 'log.source',
        value: {
          stringValue: source
        }
      },
      {
        key: 'timestamp',
        value: {
          stringValue: new Date().toISOString()
        }
      },
      {
        key: 'environment',
        value: {
          stringValue: 'development'
        }
      }
    ];

    // Adicionar atributos customizados
    if (customAttributes) {
      Object.entries(customAttributes).forEach(([key, value]) => {
        attrs.push({
          key: key,
          value: this.valueToOtlp(value)
        });
      });
    }

    return attrs;
  }

  /**
   * Converte valor JavaScript para formato OTLP
   * OTLP suporta: string, int, double, bool, bytes, array, map
   */
  private valueToOtlp(value: any): any {
    if (typeof value === 'string') {
      return { stringValue: value };
    } else if (typeof value === 'number') {
      if (Number.isInteger(value)) {
        return { intValue: value };
      } else {
        return { doubleValue: value };
      }
    } else if (typeof value === 'boolean') {
      return { boolValue: value };
    } else {
      // Para arrays, objects, etc - converte para string JSON
      return { stringValue: JSON.stringify(value) };
    }
  }

  /**
   * Mapeia string de severidade para número OTLP (0-24)
   * Referência: https://opentelemetry.io/docs/reference/specification/logs/data-model/#severity_number
   */
  private mapSeverity(severity: string): number {
    const severityMap: { [key: string]: number } = {
      'TRACE': 1,
      'DEBUG': 5,
      'INFO': 9,
      'WARN': 13,
      'ERROR': 17,
      'FATAL': 21
    };
    return severityMap[severity.toUpperCase()] || 9; // Default: INFO
  }

  /**
   * Envia os logs via HTTP (JSON) para o Collector OpenTelemetry
   * O Collector serializa em Protobuf e encaminha para Dynatrace
   */
  private sendOtlpLogs(payload: any): void {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    this.http.post(this.collectorUrl, payload, { headers })
      .subscribe({
        next: (response) => {
          console.log('✅ Logs enviados ao Collector com sucesso!');
        },
        error: (error: HttpErrorResponse) => {
          console.error('❌ Erro ao enviar logs ao Collector:', error.status, error.message);
          console.error('   URL:', this.collectorUrl);
          console.error('   Dica: O Collector está rodando em Docker?');
          
          // Re-adicionar logs à fila em caso de erro (retry)
          const failedLogs = payload.resourceLogs[0].scopeLogs[0].logRecords;
          this.logQueue.unshift(...failedLogs);
          console.log(`   📥 ${failedLogs.length} logs retornados à fila para retry.`);
        }
      });
  }

  /**
   * Força o envio imediato de logs pendentes
   * Útil ao sair da aplicação
   */
  public forceFlush(): void {
    if (this.logQueue.length > 0) {
      console.log('🔄 forceFlush() acionado - enviando logs pendentes');
      this.flushLogs();
    }
  }

  /**
   * Cleanup ao destruir o serviço
   */
  ngOnDestroy(): void {
    if (this.queueTimer) {
      clearInterval(this.queueTimer);
    }
    this.forceFlush();
  }
}

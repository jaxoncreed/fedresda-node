import React, { useCallback, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Button, Text } from 'linked-data-browser';
import { useSolidAuth } from '@ldo/solid-react';

const DEFAULT_MEAN_QUERY = `{
  "graphPath": {
    "start": {},
    "steps": []
  }
}`;

export function MeanQueryTester() {
  const { fetch } = useSolidAuth();
  const [meanQueryText, setMeanQueryText] = useState<string>(DEFAULT_MEAN_QUERY);
  const [meanQueryResult, setMeanQueryResult] = useState<string>('');
  const [meanQueryError, setMeanQueryError] = useState<string>('');
  const [isSendingMeanQuery, setIsSendingMeanQuery] = useState<boolean>(false);

  const sendMeanQuery = useCallback(async () => {
    if (isSendingMeanQuery) return;

    let parsedQuery: unknown;
    try {
      parsedQuery = JSON.parse(meanQueryText);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setMeanQueryError(`Invalid JSON: ${message}`);
      setMeanQueryResult('');
      return;
    }

    setIsSendingMeanQuery(true);
    setMeanQueryError('');
    setMeanQueryResult('');
    try {
      const response = await fetch(`${window.location.origin}/.api/stat/mean`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(parsedQuery),
      });
      const responseText = await response.text();
      let responseBody: unknown = responseText;
      if (responseText) {
        try {
          responseBody = JSON.parse(responseText);
        } catch {
          // Keep raw text response when body is not JSON.
        }
      }
      const renderedResponse =
        typeof responseBody === 'string'
          ? responseBody
          : JSON.stringify(responseBody, null, 2);
      if (!response.ok) {
        setMeanQueryError(renderedResponse || `Request failed with ${response.status}`);
        setMeanQueryResult('');
        return;
      }
      setMeanQueryResult(renderedResponse || '(empty response)');
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setMeanQueryError(message);
      setMeanQueryResult('');
    } finally {
      setIsSendingMeanQuery(false);
    }
  }, [fetch, isSendingMeanQuery, meanQueryText]);

  return (
    <View style={styles.section}>
      <Text variant="h3" style={styles.title}>
        Mean Query Tester
      </Text>
      <Text style={styles.subtitle}>
        Enter JSON to send an authenticated request to `/.api/stat/mean`.
      </Text>
      <TextInput
        value={meanQueryText}
        onChangeText={setMeanQueryText}
        multiline
        autoCapitalize="none"
        autoCorrect={false}
        spellCheck={false}
        style={styles.input}
      />
      <View style={styles.actions}>
        <Button
          text={isSendingMeanQuery ? 'Sending...' : 'Send'}
          variant="secondary"
          onPress={sendMeanQuery}
        />
      </View>
      {!!meanQueryError && (
        <View style={styles.errorBox}>
          <Text style={styles.codeText}>{meanQueryError}</Text>
        </View>
      )}
      {!!meanQueryResult && (
        <View style={styles.resultBox}>
          <Text style={styles.codeText}>{meanQueryResult}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'hsl(var(--border))',
    borderRadius: 10,
    padding: 12,
    backgroundColor: 'hsl(var(--card))',
  },
  title: {
    marginBottom: 4,
  },
  subtitle: {
    marginBottom: 10,
    color: 'hsl(var(--muted-foreground))',
    fontSize: 13,
  },
  input: {
    minHeight: 150,
    borderWidth: 1,
    borderColor: 'hsl(var(--border))',
    borderRadius: 8,
    padding: 10,
    backgroundColor: 'hsl(var(--background))',
    fontFamily: 'monospace',
    fontSize: 12,
    textAlignVertical: 'top',
  },
  actions: {
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  errorBox: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'hsl(0 75% 60%)',
    borderRadius: 8,
    padding: 10,
    backgroundColor: 'hsl(0 75% 60% / 0.12)',
  },
  resultBox: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'hsl(var(--border))',
    borderRadius: 8,
    padding: 10,
    backgroundColor: 'hsl(var(--muted) / 0.35)',
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 12,
  },
});
